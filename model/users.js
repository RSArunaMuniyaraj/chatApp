// required modules
const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var usersSchema = new Schema({
	"firstName" : {type:String, default:""},
	"lastName" : {type:String, default:""},
	"accessToken" : {type:String,default:""},
	"mobileNumber" : {type:Number, default : 0},
	"emailAddress" : {type:String, default:""},
	"dob" : {type:String},
	"signupStatus" : {type:Number, default : 0},
	"password" : {type:String,default:""},
	"confirmPassword" : {type:String,default:""},
	"profileImage" : {type:String,default:""},
	"deleteStatus" :{type:Number,default:""},
	"socketID" : {type:String,default:""},
})
module.exports = mongoose.model('users', usersSchema, 'users');