var mongoose = require('mongoose');

var Post = mongoose.model('Post',{
  owner:{
    type: String,
    required: true,
  },
  time:{
    type: String,
    required: true,
  },
  text:{
    type: String,
  },
  images:{
    type: Array,
  }
});

module.exports = {
  Post: Post
};
