
var app = angular.module('iomTraining', ['rzModule', 'ui.bootstrap', 'angular-star-rating']);

app.config(['$compileProvider',
		 function($compileProvider) {
		     $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|file):/);
		 }]);

		 app.config(function($sceProvider) {
  $sceProvider.enabled(false);
});
