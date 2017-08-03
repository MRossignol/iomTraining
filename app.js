
var app = angular.module('iomTraining', ['rzModule', 'ui.bootstrap', 'dark-sky']);

app.config(['$compileProvider',
		 function($compileProvider) {
		     $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|file):/);
		 }]);

app.config(['darkSkyProvider', function(darkSkyProvider) {
		  	darkSkyProvider.setApiKey('df2d7141740701587a1cde5b5d340379');
		 	}]);
