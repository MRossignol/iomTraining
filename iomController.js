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
  $scope.showSettings = false;
  $scope.clickRight = 0;
  $scope.clickLeft = 0;

  $scope.legSlider = {
    value: 2,
    options: {
      floor: 0,
      ceil: 10,
      step: 1,
      showTicks: true,
      showSelectionBar: true
    }
  };

  $scope.startSlider = {
    value: 5,
    options: {
      floor: 0,
      ceil: 5,
      step: 1,
      showTicks: true,
      showSelectionBar: true
    }
  };




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

  loadSounds();

  function handleClick () {

    if ($scope.clickLeft) {
      if ($scope.clickRight) {
        console.log('double alternate');
      }
      else {
        if ($scope.clickLeft>1) {
          console.log('double left');
        }
        else {
          console.log('left');
        }
      }
    }
      else {
        if ($scope.clickRight) {
          if ($scope.clickRight>1) {
            console.log('double right');
          }
          else {
            console.log('right');
          }
        }
      }

    $scope.clickLeft = 0;
    $scope.clickRight = 0;
  }

  function gotClick(left) {
    if (!$scope.clickLeft && !$scope.clickRight) {
      $timeout(function(){handleClick()}, 500);
    }
    if (left)
    $scope.clickLeft+=1;
    else {
      $scope.clickRight+=1;
    }
  }
  // $timeout(function(){playSound(okBuffer)}, 500);

  $scope.doClick = function(event){
    if (event.offsetX<document.getElementById('raceDisplay').clientWidth/2) {
      gotClick(true);
    }
    else {
      gotClick(false);
    }
    // console.log(event);
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
});
