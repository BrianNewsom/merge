var mongoose = require('mongoose');

var trackSchema = new mongoose.Schema({
  name: String,
  author: String,
  stems: Array
});

trackSchema.methods.addStem = function(stemId, callback){
    var track = this;
    // If no stems, add stem as only stem, else append;
    track.stems ? track.stems.push(stemId) : track.stems = [stemId];
    track.save(function(err,track){
        if (err) return next(err)
        callback(track);
    })
}

module.exports = mongoose.model('Track', trackSchema);
