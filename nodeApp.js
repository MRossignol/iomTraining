var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var multer  = require('multer');
var exec = require('child_process').exec;

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));

var baseDir = __dirname.replace(/server\/?/, "");
var uploadDir = baseDir.replace(/\/?$/, "/upload/");

var currentSkillDay = new Date();
var currentSeriesDay = new Date();
var currentSeriesId = 0;

app.get('/getSeriesId', function (req, res) {
  var newDay = new Date();
  if (newDay.toDateString() != currentDay.toDateString()) {
  currentDay = newDay;
    currentSeriesId = 0;
  }
  else {
    currentSeriesId++;
  }
  res.send("<p>"+currentSeriesId+"</p>");
  console.log(currentSeriesId);
})

app.get('/sendSeries', function (req, res) {
  var newDay = new Date();
  if (newDay.toDateString() != currentSeriesDay.toDateString()) {
  currentSeriesDay = newDay;
    currentSeriesId = 0;
  }
  else {
    currentSeriesId++;
  }

    var fileName = 'data/series/'+currentSeriesDay.toDateString().replace(/\s/g, '_')+'_'+currentSeriesId.toString()+'.json';
    console.log("received Series");
    res.send(JSON.stringify(req.query));
    fs.writeFile(fileName, JSON.stringify(req.query));
})

app.get('/sendSkills', function (req, res) {
  var newDay = new Date();
  if (newDay.toDateString() != currentSkillDay.toDateString()) {
  currentSkillDay = newDay;
  }

    var fileName = 'data/series/'+currentSeriesDay.toDateString().replace(/\s/g, '_')+'.json';
    console.log("received Series");
    res.send(req.query);
    fs.writeFile(fileName, req.query);
})

app.get('/toto', function (req, res) {
    res.send("<p>Bonjour Toto</p>");
})

var server = app.listen(4000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});
