app.controller("iomController", ['$scope', '$timeout', '$interval', '$window', '$q', 'darkSky', function($scope, $timeout, $interval, $window, $q, darkSky) {
  var audioContext = null;
  var meter = null;
  var timing = 0;
  var bufferLoader = null;

  $scope.series = [];
  $scope.series.races = [];
  $scope.race = [];
  $scope.upLegs = [];
  $scope.downLegs = [];

  $scope.wakeLockEnabled = false;
$scope.weatherDisplayed = false;
  $scope.maxDuration = 10000;
  $scope.legType = 'Up';
  $scope.started = 0;
  $scope.legNumber = 0;
  $scope.showSettings = false;
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

  //
  activate();
  // log current weather data
  function activate() {
    getNavigatorCoords()
    .then(function(position) {
      $scope.position = position;
      darkSky.getCurrent(position.latitude, position.longitude)
      .then(function(res){$scope.weather=res; console.log($scope.weather);})
      .catch(console.warn);
    })
    .catch(console.warn);
  }
  // Get current location coordinates if supported by browser
  function getNavigatorCoords() {
    var deferred = $q.defer();

    // check for browser support
    if ("geolocation" in navigator) {
      // get position / prompt for access
      navigator.geolocation.getCurrentPosition(function(position) {
        deferred.resolve(position.coords);
      });
    } else {
      deferred.reject('geolocation not supported');
    }
    return deferred.promise;
  }

$scope.showWeather = function(){
  if (!$scope.weatherDisplayed){

 darkSky.getHourlyForecast($scope.position.latitude, $scope.position.longitude).then(displayWeather);

  }
  else {
    $scope.weatherDisplayed=false;
  }
  }

  var displayWeather = function(hourly) {
      $scope.weatherDisplayed=true;
      // store speed and gust and directions and display them for 12 hours
      for () {

      }
      $scope.weather.hourly
      console.log(hourly);

  }

  //

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

  $scope.startFunc = function() {
    if ($scope.started) {
      console.log('stop')
      $scope.started = false;
      $scope.series.races.push($scope.race);
    }
    else {
      console.log('start');
      $scope.started = true;
      $scope.legNumber = 0;
      $scope.upDurations = [];
      $scope.downDurations = [];
      $scope.currentDuration = 0;
      $scope.referenceTime = 0;
      $scope.upLeg = true;
      $scope.tack = 0;
      $scope.legType = 'Up';
      $scope.race = [];
      playSound(2, startDurations[$scope.startSlider.value]);
      $timeout(function(){
        timing = new Date().getTime();
        console.log('start in 10 secs');}, (startDurations[3]-startDurations[$scope.startSlider.value]-10)*1000);
      }
    }

    function updateCurrentDuration () {
      $scope.currentDuration = new Date().getTime()-$scope.referenceTime;
      // console.log($scope.currentDuration);
      if ($scope.started) {
      $timeout(function(){
        updateCurrentDuration()}, 100);
      }
    }

    addLap = function(leg) {
      var lap = [];
lap.delay = 0;
lap.leg = $scope.legNumber;
      var newTiming = new Date().getTime();
      var duration = newTiming-timing;
      timing = newTiming;

      if (duration>$scope.maxDuration) {
        $scope.maxDuration = duration;
      }
      if (!$scope.tack) {
        lap.duration = duration-10000;
        $scope.race.events = [];
        $scope.referenceTime = timing;
        updateCurrentDuration();
      }
      else {
        lap.duration = duration;
      }
      lap.type = $scope.tack;
      $scope.race.events.push(lap);
      if (leg) {
          $scope.referenceTime = timing;
          if ($scope.tack&&$scope.upLeg) {

            var d1=0;
            var d2 = 0;
            for (var k= $scope.race.events.length-1;  k>0 ; k--) {
              if ($scope.race.events[k].type == 1) {d1+=$scope.race.events[k].duration;}
              else if ($scope.race.events[k].type == 2) {d2+=$scope.race.events[k].duration;}
              else {break;}
            }
      var lep = [];
      lep.leg = $scope.legNumber;
 lep.duration = d1+d2;
 lep.delay = d1-d2;
 lep.type = 4;
 $scope.race.events.push(lep);
          }
      }
       console.log($scope.race.events);
    }

    nextTack = function(side) {
      if ($scope.started && $scope.tack>0 && $scope.tack<3 && $scope.tack!=side){
        addLap(0);
        $scope.tack = side;
      }
    }

    nextLeg = function(side) {
      if ($scope.started){
        addLap(1);
        console.log($scope.legNumber);
        if ($scope.legNumber>$scope.legSlider.value) {
          $scope.startFunc();
          $scope.legNumber--;
        }
        if (!$scope.legNumber) {
          $scope.legNumber++;
          $scope.tack = side;
        }
        else {
          if ($scope.upLeg) {
            $scope.tack = 3;
            $scope.upLeg = false;

            if ($scope.legSlider.value%1 > 0 && $scope.legNumber>$scope.legSlider.value-.5) {
              $scope.legNumber++;
            }

          }
          else {
            console.log(side);
            $scope.tack = side;
            $scope.upLeg = true;
            $scope.legNumber++;
          }
        }
      }
      console.log($scope.race);
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
    }]);
