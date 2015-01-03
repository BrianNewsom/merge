var mongoose = require('mongoose');

var trackSchema = new mongoose.Schema({
  name: String,
  author: String,
  stems: Array
});

module.exports = mongoose.model('Track', trackSchema);
