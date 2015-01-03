var mongoose = require('mongoose');

var stemSchema = new mongoose.Schema({
  name: String,
  author: String,
  instrument: String
});

module.exports = mongoose.model('Stem', stemSchema);
