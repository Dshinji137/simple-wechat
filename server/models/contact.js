var mongoose = require('mongoose');

var Contact = mongoose.model('Contact',{
  from:{
    type: String,
    required: true,
  },
  to:{
    type: String,
    required: true,
  },
});

module.exports = {
  Contact: Contact
};
