app.controller("iomController", function($scope, $timeout, $interval, $window) {
  var audioContext = null;
  var meter = null;
  var timing = 0;
  var bufferLoader = null;

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
  $scope.showSettings = true;
  $scope.clickRight = 0;
  $scope.clickLeft = 0;
  $scope.tack = 0;
  $scope.firstPoint = 0;
  $scope.firstPointLocation = [];

  $scope.legSlider = {
    value: 2,
    options: {
      floor: 0,
      ceil: 10,
      step: 0.5,
      precision: 1,
      showTicks: 1,
      showSelectionBar: true
    }
  };

  $scope.startSlider = {
    value: 0,
    options: {
      floor: 0,
      ceil: 2,
      step: 1,
      showTicks: true,
      showSelectionBar: true
    }
  };

  $scope.distanceSlider = {
    value: 100,
    options: {
      floor: 0,
      ceil: 200,
      step: 20,
      showTicks: true,
      showSelectionBar: true
    }
  };


  var startDurations = [117, 63, 0, 127];


  var noSleep = new NoSleep();

  function loadSounds() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // grab an audio context
    audioContext = new AudioContext();

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

  function playSound(id, start) {
    var source = audioContext.createBufferSource(); // creates a sound source
    // console.log(buffer);
    source.buffer = bufferLoader.bufferList[id];                    // tell the source which sound to play
    source.connect(audioContext.destination);       // connect the source to the context's destination (the speakers)
    source.start(0, start);
  }


  $scope.wake = function() {
    console.log($scope.wakeLockEnabled)

    if (!$scope.wakeLockEnabled) {
      noSleep.enable(); // keep the screen on!
      $scope.wakeLockEnabled = true;
      $scope.wakeValue = "Wake Lock is enabled";
      requestFullScreen(document.documentElement);
    } else {
      outFullScreen();
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
      $scope.tack = 0;
      $scope.legType = 'Up';
      playSound(2, startDurations[$scope.startSlider.value]);
      $timeout(function(){
        timing = new Date().getTime();
        console.log('started');}, (startDurations[3]-startDurations[$scope.startSlider.value])*1000);
      }
    }

    nextTack = function(side) {
      if ($scope.started){
        var newTiming = new Date().getTime();
        $scope.tack = side;
        if (!$scope.tack) {
          // pre start

        }
        else {

        }
      }
    }

    nextLeg = function(side) {
      if ($scope.started){
        var newTiming = new Date().getTime();
        var duration = newTiming-timing;
        timing = newTiming;

        if ($scope.upLeg) {
          $scope.tack = 3;
          $scope.upLeg = false;
          $scope.upDurations.push(duration);
        }
        else {
          console.log(side);
          $scope.tack = side;
          $scope.upLeg = true;
          $scope.legNumber++;
          $scope.downDurations.push(duration);
        }
        if (duration>$scope.maxDuration) {
          $scope.maxDuration = duration;
        }
        if ($scope.legNumber>$scope.legSlider.value) {
          $scope.startFunc(1);
          $scope.legNumber--;
        }
      }
    }

    loadSounds();

    function handleClick () {
      if ($scope.clickLeft) {
        if ($scope.clickRight) {
          console.log('double alternate');
          $scope.startFunc();
        }
        else {
          if ($scope.clickLeft>1) {
            console.log('double left');
            nextLeg(1);
          }
          else {
            console.log('left');
            nextTack(1);
          }
        }
      }
      else {
        if ($scope.clickRight) {
          if ($scope.clickRight>1) {
            console.log('double right');
            nextLeg(2);
          }
          else {
            console.log('right');
            nextTack(2);
          }
        }
      }

      $scope.clickLeft = 0;
      $scope.clickRight = 0;
    }

    function gotClick(side) {
      if (!$scope.clickLeft && !$scope.clickRight) {
        $timeout(function(){handleClick()}, 500);
      }
      if (side)
      $scope.clickLeft+=1;
      else {
        $scope.clickRight+=1;
      }
    }
    // $timeout(function(){playSound(okBuffer)}, 500);

    $scope.doClick = function(event){
      if (event.offsetX<document.getElementById('raceDisplay').clientWidth/4) {
        gotClick(true);
      }
      else if (event.offsetX>3*document.getElementById('raceDisplay').clientWidth/4) {
        gotClick(false);
      }
      console.log(event);
    };

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
        case 33: // p up
        gotClick(true);
        break;
        case 34: // p down
        gotClick(false);
        break;
      }
      console.log(e.keyCode)
    };

    function requestFullScreen(element) {
      // Supports most browsers and their versions.
      var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

      if (requestMethod) { // Native full screen.
        requestMethod.call(element);
      } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
          wscript.SendKeys("{F11}");
        }
      }
    }
    function outFullScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }

    if (Number.prototype.toRadians === undefined) {
      Number.prototype.toRadians = function() { return this * Math.PI / 180; };
    }

    function getDistance(lat1, lon1, lat2, lon2) {
      var R = 6371e3; // metres
      var φ1 = lat1.toRadians();
      var φ2 = lat2.toRadians();
      var Δφ = (lat2-lat1).toRadians();
      var Δλ = (lon2-lon1).toRadians();

      var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      var d = R * c;
      return d;
    }

    $scope.setDistance = function () {
      if ("geolocation" in navigator) {
              console.log($scope.firstPoint);
        // get position / prompt for access
        navigator.geolocation.getCurrentPosition(function(position) {
          $scope.$apply(function(){
          if (!$scope.firstPoint) {
            $scope.firstPointLocation = position.coords;
            $scope.firstPoint = 1;
              console.log($scope.firstPoint);
            console.log(position.coords);
          }
          else {
            var distance = 0;
            $scope.firstPoint = 0;
            distance = getDistance($scope.firstPointLocation.latitude, $scope.firstPointLocation.longitude, position.coords.latitude, position.coords.longitude)*1000;
            $scope.distanceSlider.value = distance;
            console.log(distance);
          }})
        }, function(position) {'Unable to get location'});
      }
    }
  });
