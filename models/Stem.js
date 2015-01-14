var mongoose = require('mongoose');

var stemSchema = new mongoose.Schema({
  name: String,
  author: String,
  url: String,
  instrument: String
});


/*
 to JSON implementation
*/

stemSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

module.exports = mongoose.model('Stem', stemSchema);
