
var app = angular.module('iomTraining', ['rzModule', 'ui.bootstrap']);

app.config(['$compileProvider',
		 function($compileProvider) {
		     $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|file):/);
		 }]);
