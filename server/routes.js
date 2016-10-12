var http = require("http");

module.exports = function(app) {	
	// Routes
	
	app.get('/', function(req, res){
		res.json(Date.now());	
  });
  
  app.get('*', function(req, res) {
	  res.send(404);
  });
	
}