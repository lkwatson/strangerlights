// Dependencies
var express         = require('express');
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var mongoose        = require('mongoose');

var port            = 80;
var app             = express();

var config = require('./config');

require('./messages_model.js');

mongoose.connect(config.dburl,function(err) {
  if (err) {
    console.log(err);
  }else{
    console.log("Connected to DB");	
  }
});

app.use(morgan(':date[clf] :method :status :url :remote-addr :response-time ms - :res[content-length]',{
	skip: function (req, res) { return req.query.updateRequest === 'true' }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

require('./routes.js')(app); //add ",passport)" if needed

// Functional things below

// Shhh!, did you hear that?!
// Shhhh, just
app.listen(port);
console.log('Listen: ' + port);