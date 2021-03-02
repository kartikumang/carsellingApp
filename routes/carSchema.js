var mongoose = require('mongoose');


var carSchema = mongoose.Schema({
    sellerid:
        { 
          type:mongoose.Schema.Types.ObjectId,
          ref:'user'
        }
      ,
 carprice:String,
 carname:String,
 contact:String,
 carimg: {
     type:String,
     required:true
 }
})

module.exports = mongoose.model('car',carSchema);