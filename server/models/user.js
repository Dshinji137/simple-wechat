var mongoose = require('mongoose');

var User = mongoose.model('User',{
  email:{
    type: String,
    required: true,
    unique:true,
  },
  name:{
    type: String,
    required: true,
    minLength: 1,
    trim: true
  },
  password:{
    type: String,
    required: true,
    minLength: 6,
  },
  contacts:{
    type: Array,
    required:true,
  }
  /*
  _creator: {
    required:true,
    type:mongoose.Schema.Types.ObjectId
  }
  */
});

module.exports = {
  User: User
};
