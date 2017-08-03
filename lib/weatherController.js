app.controller('weatherController', WeatherCtrl);

WeatherCtrl.$inject = ['$q', 'darkSky'];

function WeatherCtrl($q, darkSky) {
  activate();
  // log current weather data
  function activate() {
    getNavigatorCoords()
    .then(function(position) {
      darkSky.getCurrent(position.latitude, position.longitude)
      .then(console.log)
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
};
