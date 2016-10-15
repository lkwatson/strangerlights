var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  message       : String,
  ip            : String,
  dateSent      : { type: Date, default: Date.now },
  displayed     : { type: String, default: 'false' }, //can be false, now, true
});

module.exports = mongoose.model('Message', messageSchema);