var http = require('http');
var config = require('./config');
var mongoose = require('mongoose');

var Messages = require('./messages_model');

var rateLimit = require('express-rate-limit');

var useLimiter = rateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 1,              // 1 request per window  
  delayMs: 100         // 100ms request delay
});

module.exports = function(app) {	
	// Routes
	
	app.get('/', function(req, res){
		res.json(Date.now());	
  });
  
  app.post('/contact-other-side', useLimiter, function(req, res){
		res.json(Date.now());	
  });
  
  app.get('*', function(req, res) {
	  res.sendStatus(404);
  });
	
}