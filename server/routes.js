var http = require('http');
var config = require('./config');
var mongoose = require('mongoose');

var Message = require('./messages_model');

var rateLimit = require('express-rate-limit');

var useLimiter = rateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 100,              // 1 request per window  
  delayMs: 100         // 100ms request delay
});

module.exports = function(app) {	
	// Allow CORS
	
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});
	
	// Routes
	
	app.get('/', function(req, res){
		res.json(Date.now());	
  });
  
  /*
  This endpoint will return data about messages in the following form:
  The three previously displayed messages
  The currently playing message. If none playing, returns "Preselected patterns (Send a message!)"
  A list of messages not played yet
  */
  app.get('/messagequeue', function(req,res){
    //I'm sorry for this callback hell, TODO: use async
    
    //only get the last three messages that have been displayed
    Message.find({'displayed':'true'},{ip:0}).sort('-dateSent').limit(3).exec(function(err,docOld){
      if (err) {
        console.log(err)
        res.sendStatus(500);
      }
      
      Message.find({'displayed':'now'},{ip:0}, function(err,docNow){
        if (err) {
          console.log(err)
          res.sendStatus(500);
        }
        
        Message.find({'displayed':'false'},{ip:0}).sort('dateSent').exec(function(err,docNew){
          if (err) {
            console.log(err)
            res.sendStatus(500);
          }
          
          res.send( docOld.concat(docNow.concat(docNew)) );
          
        });
        //sorry
      });
      //sorry
    });
    //sorry
  });
  
  //Post a message
  app.post('/willareyouthere', useLimiter, function(req, res){
    
    Message.create(
      {
        'message'   : req.body.message,
        'ip'        : req.connection.remoteAddress,
        'dateSent'  : new Date(),
        'displayed' : 'false'
      },
      function(err,doc) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }  
        res.sendStatus(200);
      }
    );
		
  });
  
  app.get('*', function(req, res) {
	  res.sendStatus(404);
  });
	
}