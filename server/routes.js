var http = require("http");
var config = require('./config');

module.exports = function(app) {	
	// Routes
	
	app.get('/', function(req, res){
		res.json(Date.now());	
  });
  
  app.get('*', function(req, res) {
	  res.sendStatus(404);
  });
	
}