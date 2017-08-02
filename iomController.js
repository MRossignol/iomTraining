function BufferLoader(context, urlList, callback) {
	this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

app.controller("iomController", function($scope, $timeout, $interval, $window) {
  var audioContext = null;
  var analyzer = null;
  var meter = null;
  var timing = 0;
  var detector = null;
  var bufferLoader = null;
  $scope.sensitivity = 0;
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

  $scope.clickSlider = {
    value: 1,
    options: {
      floor: 1,
      ceil: 5,
      step: 1,
      showTicks: true,
      showSelectionBar: true
    }
  };

  $scope.sensitivitySlider = {
    value: 1.2,
    options: {
      floor: 1,
      ceil: 5,
      step: 0.05,
      precision: 1,
      showTicks: .2,
      showSelectionBar: true
    }
  };

  $scope.powerSlider = {
    value: 2,
    options: {
      floor: 1,
      ceil: 10,
      step: 0.2,
      precision: 1,
      showTicks: .5,
      showSelectionBar: true
    }
  };

  var noSleep = new NoSleep();

  // function onError(){console.log('Unable to load audio data');}

  // function loadSound(url) {
  //   var request = new XMLHttpRequest();
  //   request.open('GET', url, true);
  //   request.responseType = 'arraybuffer';
  //
  //   // Decode asynchronously
  //   request.onload = function() {
  //     audioContext.decodeAudioData(request.response, function(buffer) {
  //       okBuffer = buffer;
  //     }, onError);
  //   }
  //   request.send();
  // }

  function loadSounds() {
    bufferLoader = new BufferLoader(
       audioContext,
       [
         'sounds/ok.wav',
         'sounds/tick.wav',
         'sounds/startVrc.webm',
       ],
       finishedLoading
       );
     bufferLoader.load();
  }

  function finishedLoading(){
    console.log('Done with loading audio files.');
  }

  function playSound(id) {
  var source = audioContext.createBufferSource(); // creates a sound source
  // console.log(buffer);
  source.buffer = bufferLoader.bufferList[id];                    // tell the source which sound to play
  source.connect(audioContext.destination);       // connect the source to the context's destination (the speakers)
  source.start(0);
}


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
        detector.sensitivityThreshold = $scope.sensitivitySlider.value;
        detector.powerThreshold = $scope.powerSlider.value;
        $scope.power = detector.power.toFixed(2);
        $scope.sensitivity = detector.sensitivity.toFixed(2);
        $scope.powerAverage = detector.powerAverage/detector.powerBuffer.length;
        $scope.powerAverage = $scope.powerAverage.toFixed(4);
        $scope.sensitivityAverage = detector.sensitivityAverage/detector.sensitivityBuffer.length;
        $scope.sensitivityAverage = $scope.sensitivityAverage.toFixed(2);
        $scope.powerMax = detector.powerMax.toFixed(4);
        $scope.sensitivityMax = detector.sensitivityMax.toFixed(2);

      if (detector.clickDetected && detector.active) {
        detector.active = false;

        if ($scope.clickDetected == 0) {
          $timeout(function(){$scope.clickDetected = 0;}, 2000);
        }
        $scope.clickDetected += 1;
        if ($scope.clickDetected>=$scope.clickSlider.value) {
          nextLeg();
          playSound(0);
        }
        $timeout(function(){detector.active = true; detector.clickDetected = 0;}, 100);
      }
    }
    $scope.currentDuration = new Date().getTime()-timing;
      $timeout(function(){update()}, 100);
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
  update();
      }
  }

   launchDetector();

   loadSounds();
    // $timeout(function(){playSound(okBuffer)}, 500);



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
        case 76: // l
        nextLeg();
        break;
        case 83: // s
        $scope.startFunc();
        break;
      }
      //  console.log(e.keyCode)
    };
  });
