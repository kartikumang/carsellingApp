var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/sell');

var userSchema = mongoose.Schema({
  cars:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'car'
    }
  ],
  username:String,
  password:String,
  email:String,
  name:String,
  prflimg:{
    type:String,
    default:'../images/uploads/default.png'
  }
})
userSchema.plugin(plm);
module.exports = mongoose.model('user',userSchema);