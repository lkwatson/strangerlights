var http = require('http');
var config = require('./config');
var mongoose = require('mongoose');

var map = Array.prototype.map;

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
      //get message displaying now
      Message.find({'displayed':'now'},{ip:0}, function(err,docNow){
        if (err) {
          console.log(err)
          res.sendStatus(500);
        }
        //get messages not displayed
        Message.find({'displayed':'false'},{ip:0}).sort('dateSent').exec(function(err,docNew){
          if (err) {
            console.log(err)
            res.sendStatus(500);
          }
          
          res.send( docOld.reverse().concat(docNow.concat(docNew)) );
          
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
  
  app.get('/iot/getmessage', function(req,res){
    
    if(req.query.password == config.iotPassword) {
      
      Message.find({'displayed':'false'},{ip:0}).sort('dateSent').limit(1).exec(function(err,doc){
        if (err) {
          console.log(err)
          res.sendStatus(500);
        }
        
        //just in case there's an error and a message isn't marked as shown.
        Message.update({ 'displayed': 'now' }, { 'displayed': 'true' }, { multi: true }, function (err, ret) {
          if (err) { 
            console.log(err); 
          }
          
          if(doc[0]) {
            Message.update({'_id': doc[0]._id}, { 'displayed': 'now' }, function (err, ret2) {
              if (err) { 
                console.log(err); 
              }
            });
          }
          
        });
        
        //create the sequence of string light information to send
        if (doc[0]) {
          var lowercaseMessage = doc[0].message.toLowerCase();
          //this makes a - 0, b - 1, c - 2, etc.
          var stringLightInfo = map.call(lowercaseMessage, function(x) { 
            charcode = x.charCodeAt(0) - 97;
            if (charcode == -65) {
              return 26 //26 is our declaration for space, or a pause
            }else{
              return charcode
            } 
          });
                
          console.log("Send string light code: ",lowercaseMessage);
          
          res.send(lowercaseMessage);
        }else{
          //a default of "IM HERE" [ 8, 12, 26, 7, 4, 17, 4 ]
          res.send("abacaddbca")
        }
        
      });
      
    }else{
      res.sendStatus(401);
    }
      
  });
  
  app.get('/iot/markdisplayed', function(req,res){
    
    if(req.body.password == config.iotPassword) {
      
      //just in case there's an error and multiple messages are marked as being shown
      Message.update({ 'displayed': 'now' }, { 'displayed': 'true' }, { multi: true }, function (err, ret) {
        if (err) { 
          console.log(err); 
        }
      });
      
    }else{
      res.sendStatus(401);
    }
      
  });
  
  app.get('*', function(req, res) {
	  res.sendStatus(404);
  });
	
}