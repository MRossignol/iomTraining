
var app = angular.module('iomTraining', []);

app.config(['$compileProvider',
		 function($compileProvider) {
		     $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|file):/);
		 }]);
