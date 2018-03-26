var mongoose = require('mongoose');

var Message = mongoose.model('Message',{
  from:{
    type: String,
    required: true,
  },
  to:{
    type: String,
    required: true,
  },
  time:{
    type: String,
    required: true,
  },
  content:{
    type: String,
    required: true,
  },
  /*
  _creator: {
    required:true,
    type:mongoose.Schema.Types.ObjectId
  }
  */
});

module.exports = {
  Message: Message
};
