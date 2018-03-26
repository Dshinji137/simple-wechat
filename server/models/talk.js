var mongoose = require('mongoose');

var Talk = mongoose.model('Talk',{
  owner:{
    type: String,
    required: true,
  },
  chatter:{
    type: String,
    required: true,
  },
  unread:{
    type: Array,
    default:[]
  },
  read:{
    type: Array,
    default:[],
  }
});

module.exports = {
  Talk: Talk
};
