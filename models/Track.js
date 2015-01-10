var mongoose = require('mongoose');

var trackSchema = new mongoose.Schema({
  name: String,
  author: String,
  rep: { type: Number, default: 0 },
  stems: { type: Array, default: []},
  forkOf: { type: String, default: ''}
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
        cb(tracks);
    });
}

trackSchema.options.toJSON = {
    // Removes id - be careful
    transform: function(doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

module.exports = mongoose.model('Track', trackSchema);
