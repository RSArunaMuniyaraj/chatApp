// required modules
const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var chatDetailsSchema = new Schema({
	"senderId" : {type:mongoose.Schema.Types.ObjectId,default :""},
	"receiverId" : {type:mongoose.Schema.Types.ObjectId,default :""},
	"senderName":{type:String, default:""},
	"receiverName":{type:String, default:""},
	"message" : {type:String,default:""},
	"lastMsgBy" : {type:mongoose.Schema.Types.ObjectId,default :""},
	"messageStatus" : {type:Number, default : 0},
})
module.exports = mongoose.model('chatDetails', chatDetailsSchema, 'chatDetails');