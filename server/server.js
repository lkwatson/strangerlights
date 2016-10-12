// Dependencies
var express         = require('express');
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');

var port            = 80;
var app             = express();

app.use(morgan(':date[clf] :method :status :url :remote-addr :response-time ms - :res[content-length]',{
	skip: function (req, res) { return req.query.updateRequest === 'true' }
}));

app.use(bodyParser.json());                                     // Parse dat 
app.use(bodyParser.urlencoded({extended: true}));               // Mmmmm URL parsing
app.use(bodyParser.text());                                     // Aww yea look at some raw text 
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override'));

require('./routes.js')(app); //add ",passport)" if needed

// Functional things below

// Shhh!, did you hear that?!
// Shhhh, just
app.listen(port);
console.log('Listen: ' + port);