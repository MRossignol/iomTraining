app.controller("ptController", ['$scope', '$timeout', '$interval', '$window', '$q', function($scope, $timeout, $interval, $window, $q, darkSky) {

  $scope.editMode = false;
  $scope.newItem = '';
  $scope.newSection = '';
  $scope.currentSection = 0;

  $scope.legSlider = {
    value: 0,
    options: {
      floor: 0,
      ceil: 10,
      step: 1,
      precision: 0,
      showTicks: 1,
      showSelectionBar: true
    }
  };

var items = ['wind', 'rig', 'main', 'jib'];
$scope.sections = [];
var section = [];
section.items = [];
section.name = 'tuning';
for (var k=0;k<items.length;k++){
  var item = {value: 0, mean: 0, data: [], name: items[k]};
  section.items.push(item);
}
$scope.sections.push(section);

$scope.addItem =function(e){
  if ($scope.newItem) {
  var item = {value: 0, mean: 0, data: [], name: $scope.newItem};
$scope.sections[$scope.currentSection].items.unshift(item);
$scope.newItem='';
}
}

$scope.removeItem =function(index){
$scope.sections[$scope.currentSection].items.splice(index, 1);
}
$scope.moveItemDown =function(index){
$scope.sections[$scope.currentSection].items.splice(index+1, 0, $scope.sections[$scope.currentSection].items.splice(index, 1)[0]);
}
$scope.moveItemUp =function(index){
$scope.sections[$scope.currentSection].items.splice(index-1, 0, $scope.sections[$scope.currentSection].items.splice(index, 1)[0]);
}

$scope.moveSectionUp =function(){
$scope.sections.splice($scope.currentSection-1, 0, $scope.sections.splice($scope.currentSection, 1)[0]);
$scope.currentSection -= 1;
}

$scope.moveSectionDown =function(){
$scope.sections.splice($scope.currentSection+1, 0, $scope.sections.splice($scope.currentSection, 1)[0]);
$scope.currentSection += 1;
}

$scope.addSection =function(e){
  if ($scope.newSection) {
  var section = {items: [], name: $scope.newSection};
  $scope.sections.push(section);
  $scope.newSection='';
  $scope.currentSection += 1;
}
}

$scope.removeSection =function(){
  if ($scope.currentSection) {
$scope.sections.splice($scope.currentSection, 1);
$scope.currentSection -= 1;
}
}

$scope.changeSection =function(direction){
  console.log($scope.currentSection);
console.log($scope.sections);
// save data and compute mean
for (var k=0;k<$scope.sections[$scope.currentSection].items.length;k++){
if ($scope.sections[$scope.currentSection].items[k].value) {
$scope.sections[$scope.currentSection].items[k].data.push($scope.sections[$scope.currentSection].items[k].value);
$scope.sections[$scope.currentSection].items[k].value = 0;

$scope.sections[$scope.currentSection].items[k].mean = $scope.sections[$scope.currentSection].items[k].data.reduce(( p, c ) => p + c, 0 )/$scope.sections[$scope.currentSection].items[k].data.length;
}
}
// move to next section
$scope.currentSection = ($scope.currentSection+direction) % ($scope.sections.length);
if ($scope.currentSection<0) {
  $scope.currentSection = $scope.sections.length-1;
}
console.log($scope.currentSection);
}

// sortable list https://codepen.io/yukulele/pen/BlFCr

        }]);
