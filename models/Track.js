var mongoose = require('mongoose');

var trackSchema = new mongoose.Schema({
  name: String,
  author: String,
  rep: Number,
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

trackSchema.methods.addRep = function(cb){
    var track = this;
    track.rep ? track.rep = track.rep + 1 : track.rep = 1;
    track.save(function(err,track){
        if (err) return next(err)
        cb(track);
    })
}
trackSchema.statics.getTop = function(n, cb){
    // TODO: add rep to determine popularity
    var query = this.find().sort({'rep':-1}).limit(n);
    query.exec(function(err, tracks){
        console.log(tracks);
        cb(tracks);
    });
}

module.exports = mongoose.model('Track', trackSchema);
