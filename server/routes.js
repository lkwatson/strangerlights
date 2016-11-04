/************************
 * Stranger Lights Server. Strangerlights.com
 * 
 * A halloween IoT project. Aphabet light board that displays messages from a server.
 * 
 * Copyright 2016 Lucas Watson
 * 
 * Released under GPL-3.0
************************/

var http = require('http');
var config = require('./config');
var mongoose = require('mongoose');

var map = Array.prototype.map;

var Message = require('./messages_model');

var rateLimit = require('express-rate-limit');

var useLimiter = rateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 2,              // 1 request per window  
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

    var messageForTests = (req.body.message) ? req.body.message.replace(/[^A-Za-z ]+/g, '') : " ";
    
    if (messageForTests.match(/^\s+$/) || messageForTests.length == 0) { //if only spaces present
      res.sendStatus(400)
    }else if(messageForTests.length > 25) {
      res.sendStatus(400)
    }else if(testForNaughtyStuff(messageForTests)) {
      res.sendStatus(400)
    }else{//if the message is okay, send it
    
      Message.create(
        {
          'message'   : messageForTests,
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
      
    }
		
  });
  
  function testForNaughtyStuff(string) {
    //These are all naughty words that we don't want to be posted publically
    //While this code can be circumvented, it's mainly intended for gracefully 
    //telling the user to be more polite. This code is also active on the server side
    
    //Note that for a variety of reasons, the naughty words in question have 
    //been shifted with a caesar cipher.
    
    var naughtyWords = ["kzhp", "kzh", "xmny", "yny", "hqnytwnx", "{flnsf", "snljw", "snlf", "ujsnx", "mtqthfzxy", "oj|", "ywzru", "mnqfw~", "hqnsyts", "gttgx", "fwxj", "gnyhm", "gfxyfwi", "gtsjw", "gzyy", "hthp", "htts", "hzr", "hzsy", "inqit", "jofhzqfyj", "kfl", "kflty", "kflty", "khzp", "kjqqfy", "kzp", "mtws~", "on", "on", "qfgnf", "rfxyjwgfyj", "rfxyjwgfynts", "twlfxr", "umzp", "unxx", "utws", "uzxx~", "wjyfwi", "xj}", "xjrjs", "xrjlrf", "{zq{f", "|fsp", "|mtwj", "mnyqjw", "sfn", "gtrg", "lzs", "snll", "mfwi", "inhp", "xzhp", "uwjlsfsy","hmtij","yzwsjw","khp","szy","fsfq","myqjw","myqw","mws~","k{hp","gyhm"];;
    var naughtyWordsWRepeat = ["fxx","snlljw", "snllf","snll","ppp","lf~"];
    //uncomment to create a new Caesar array
    /*
    newArray = []
    for(j = 0; j < naughtyWords.length; j++) {
      newArray[j] = caesar(naughtyWords[j],5);
    }
    */
    //console.log(caesar("testword",5))
    
    stringWhole = string.toLowerCase().replace(/\s/g, '');
    string = string.toLowerCase().replace(/\s/g, '').replace(/(.)\1{1,}/g, '$1');
    console.log(string);
    
    for(j = 0; j < naughtyWords.length; j++) {
      var wordToTest = caesar(naughtyWords[j],-5);
      
      if(string.indexOf(wordToTest) >= 0) {

        return true;
        break;
      }
    }
    for(k = 0; k < naughtyWordsWRepeat.length; k++) {
      var wordToTest = caesar(naughtyWordsWRepeat[k],-5);
      
      if(stringWhole.indexOf(wordToTest) >= 0) {

        return true;
        break;
      }
    }
    
    return false;
  }
  
  function caesar(str,shift) {
    result = '';
    for (i = 0; i < str.length; i++) {
      ccode = (str[i].charCodeAt()) + shift;
      result += String.fromCharCode(ccode);
    }
    return result;
  }
  
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
          
          //Since the lights are not strung in alphabetical order, we can't just say
          //A = light0. So this 'translates' the message into the light string order
          //This is done here, because it would be harder and more resource intensive
          //if done on the IoT device
          lowercaseMessage = lowercaseMessage.replace(/[a-z]/g, function (m) {
            return {
              'a': 'w',
              'b': 'v',
              'c': 'm',
              'd': 'l',
              'e': 'e',
              'f': 'd',
              'g': 'x',
              'h': 'u',
              'i': 'n',
              'j': 'k',
              'k': 'f',
              'l': 'c',
              'm': 'y',
              'n': 't',
              'o': 'o',
              'p': 'p',
              'q': 'j',
              'r': 'g',
              's': 'b',
              't': 'z',
              'u': 's',
              'v': 'r',
              'w': 'q',
              'x': 'i',
              'y': 'h',
              'z': 'a',
            }[m];
          });
                        
          console.log("Send string light code: ",lowercaseMessage);
          
          res.send(lowercaseMessage);
        }else{
          //a default of "IM HERE" [ 8, 12, 26, 7, 4, 17, 4 ]
          res.send("+") //triggers standby lights
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