
app.controller("iomController", function($scope, $timeout, $interval, $window) {
  var audioContext = null;
  var analyzer = null;
  var meter = null;
  var timing = 0;
  var detector = null;
  $scope.sensitivity = 1;
  $scope.power = 0;
  $scope.clickDetected = 0;
  $scope.move = 0;
  $scope.wakeLockEnabled = false;
  $scope.wakeValue = "Wake Lock is disabled";

  $scope.upDurations = [];
  $scope.downDurations = [];
  $scope.upStore = [];
  $scope.downStore = [];
  $scope.maxDuration = 1;
  $scope.legType = 'Up';
  $scope.infoText = 'start';
  $scope.started = 0;
  $scope.legNumber = 1;
  $scope.nbUpStore = 0;
  $scope.nbDownStore = 0;

  $scope.legSlider = {
    value: 3,
    options: {
      floor: 1,
      ceil: 10,
      step: 1,
      showTicks: true,
      showSelectionBar: true
    }
  };

  $scope.tuneSlider = {
    value: 50,
    options: {
      floor: 0,
      ceil: 100,
      step: 1,
      showTicks: true,
      showSelectionBar: true
    }
  };

  var noSleep = new NoSleep();



  $scope.wake = function() {
    console.log($scope.wakeLockEnabled)
    if (!$scope.wakeLockEnabled) {
      noSleep.enable(); // keep the screen on!
      $scope.wakeLockEnabled = true;
      $scope.wakeValue = "Wake Lock is enabled";
    } else {
      noSleep.disable(); // let the screen turn off.
      $scope.wakeLockEnabled = false;
      $scope.wakeValue = "Wake Lock is disabled";
    }
  }



    $scope.startFunc = function(store = false) {
      if ($scope.started) {
        console.log('stop')
        $scope.started = false;
        $scope.infoText = 'start';
        if (store) {
        $scope.upStore = $scope.upStore.concat($scope.upDurations);
        $scope.downStore = $scope.downStore.concat($scope.downDurations);
        $scope.nbUpStore = $scope.upStore.length;
        $scope.nbDownStore = $scope.downStore.length;
        }
        }
      else {
        console.log('start');
        $scope.infoText = 'stop';
        $scope.started = true;
        $scope.legNumber = 1;
        $scope.upDurations = [];
        $scope.downDurations = [];
        $scope.currentDuration = 0;
        $scope.upLeg = true;
        $scope.legType = 'Up';
        timing = new Date().getTime();
      }
    }

    nextLeg = function() {
      if ($scope.started){
        var newTiming = new Date().getTime();
        var duration = newTiming-timing;
        timing = newTiming;

        if ($scope.upLeg) {
          $scope.upLeg = false;
          $scope.legType = 'Down';
          $scope.upDurations.push(duration);
        }
        else {
          $scope.upLeg = true;
          $scope.legNumber++;
          $scope.legType = 'Up';
          $scope.downDurations.push(duration);
        }
        if (duration>$scope.maxDuration) {
          $scope.maxDuration = duration;
        }
        if ($scope.legNumber>$scope.legSlider.value) {
          $scope.startFunc(1);
        }
      }
    }

    var update = function(){
      if(detector) {
      detector.sensitivity = $scope.sensitivity;

      $scope.power = detector.power.toFixed(4);
      if (detector.clickDetected) {
        detector.clickDetected = 0;
        if ($scope.clickDetected == 0) {
          //  nextLeg();
        }
        $scope.clickDetected = 1;
        $timeout(function(){$scope.clickDetected = 0;}, 1000);
      }
    }
    $scope.currentDuration = new Date().getTime()-timing;
      $timeout(function(){update()}, 50);
    }

    launchDetector = function(){
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // grab an audio context
    audioContext = new AudioContext();
    // Attempt to get audio input
    try {
      // monkeypatch getUserMedia
      navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

      // ask for an audio input
      navigator.getUserMedia(
        {
          "audio": {
            "mandatory": {
              "googEchoCancellation": "false",
              "googAutoGainControl": "false",
              "googNoiseSuppression": "false",
              "googHighpassFilter": "false"
            },
            "optional": []
          },
        }, gotStream, didntGetStream);
      } catch (e) {
        alert('getUserMedia threw exception :' + e);
      }

      function didntGetStream() {
        alert('Stream generation failed.');
      }

      var mediaStreamSource = null;
      function gotStream(stream) {
        // Create an AudioNode from the stream.
        mediaStreamSource = audioContext.createMediaStreamSource(stream);

        // cw version: Create a new volume meter and connect it.
        detector = createDetector(audioContext);

        mediaStreamSource.connect(detector);

        // kick off the visual updating

      }
  }

  // launchDetector();
            update();

    document.onkeydown = function(e) {
      switch (e.keyCode) {
        case 37:
        $scope.sensitivity = 1;
        break;
        case 38:
        $scope.sensitivity += .1;
        break;
        case 40:
        $scope.sensitivity -= .1;
        $scope.sensitivity = Math.max($scope.sensitivity, 1);
        break;
        case 76:
        nextLeg();
        break;
        case 83:
        $scope.startFunc();
        break;
      }
      //  console.log(e.keyCode)
    };
  });
