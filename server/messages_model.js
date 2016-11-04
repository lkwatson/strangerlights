/************************
 * Stranger Lights Server. Strangerlights.com
 * 
 * A halloween IoT project. Aphabet light board that displays messages from a server.
 * 
 * Copyright 2016 Lucas Watson
 * 
 * Released under GPL-3.0
************************/

var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  message       : String,
  ip            : String,
  dateSent      : { type: Date, default: Date.now },
  displayed     : { type: String, default: 'false' }, //can be false, now, true
});

module.exports = mongoose.model('Message', messageSchema);