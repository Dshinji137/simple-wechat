var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// example schema
var schema = new Schema({
    img: { data: Buffer, contentType: String }
});

// our model
var Image = mongoose.model('Image', schema);

module.exports = {
  Image: Image
};
