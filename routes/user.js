// required modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require("multer");
const crypto = require('crypto');

// initialize the router
const router = express.Router();

// models
const users = require('../model/users');


// helpers
const encdec = require('../helpers/endecryption');
const cloudinary = require('../helpers/cloudinary');

var storage = multer.diskStorage({
	filename:function(req,file,cb){
		cb(null,file.originalname);
	}
});

var upload = multer({storage:storage});

router.post('/registeration',(req,res,next)=>{
	let userData = req.body;
	// let pwd = encdec.encrypt(userData.password);
	
		if(userData.password != userData.confirmPassword){
			res.json({status:false,message:"The password and confirm password is not same"})
		}
		else
		{
			let password = encdec.encrypt(userData.password);
			let confirmPassword = encdec.encrypt(userData.confirmPassword);

			userData.password = password;
			userData.confirmPassword = confirmPassword;

			const buf = crypto.randomBytes(32); 
			userData.accessToken = buf.toString('hex');

			users.find({"mobileNumber" : userData.mobileNumber},(err,response)=>{
				if (err) {
					res.json({status:false,message:"Query error"})
				}
				else{
					if (response.length == 0) {
						users.create(userData,(err,response)=>{
							if (err) {
								res.json({status:false,message:"Query error"})
							}
							else{	
								res.json({status:true,message:"Successfully registered"})
							}
						})
					}
					else
					{
						res.json({status:true,message:"Already registered.! please try another Mobile Number"})
					}
				}
			})
		}
})

router.post('/login',(req,res,next)=>{
	let userData = req.body;
	let password = userData.password;
	password = encdec.encrypt(password);
	
	users.find({$and:[{"mobileNumber":userData.mobileNumber},{"password": password}]},(err,response)=>{
		if(err){
			res.json({status:false,message:"Query error"})
		}
		else
		{
			if (response.length == 0) {
				res.json({status:false,message:"Invalid login credentials"})
			}
			else
			{
				
				if(response[0].deleteStatus == 1){
					res.json({status:false,message:"Your account is deleted"})
				}
				else
				{
					const buf = crypto.randomBytes(32); 
					let accessToken = buf.toString('hex');
					users.findOneAndUpdate({"mobileNumber":userData.mobileNumber},{$set:{"accessToken":accessToken}},(err,response)=>{
						if (err) {
							res.json({status:false,message:"Query error"})
						}
						else
						{
							res.json({status:true,message:"Login Successfully",accessToken:accessToken})		
						}
					})
				}
			}
		}
	})
})

router.post('/viewMyProfile',(req,res,next)=>{
	let accessToken = req.body.accessToken;
	users.find({$and:[{"accessToken":accessToken},{"deleteStatus":0}]},{"firstName":1,"lastName":1,"mobileNumber":1,"dob":1},(err,response)=>{
		if (err) {
			res.json({status:false,message:"Failed"})
		}
		else{
			if (response.length == 0) {
				res.json({status:false,message:"The account is not in active mode"})
			}
			else
			{
				let myProfile = {};
				myProfile.firstName = response[0].firstName;
				myProfile.lastName = response[0].lastName;
				myProfile.mobileNumber = response[0].mobileNumber;
				myProfile.dob = response[0].dob;

				res.json({status:true,message:"Success",myProfile:myProfile})
			}
			
		}
	})
})

router.post('/updateProfile',upload.single('profileImage'),(req,res,next)=>{
	let info = req.body;
	uploadImageCloud(req, function(data){
		updateProfileData(info,data,req,res);
	})
})

// upload image

function uploadImageCloud(req,callback){
	var uploadImg = "";
	if (typeof req.file != 'undefined' && typeof req.file != undefined && req.file.path != "") {
		cloudinary.uploadImage(req.file.path,(images)=>{
			uploadImg = images.secure_url;
			callback(uploadImg)
		});
	}
	else{
		callback(uploadImg);
	}
}

function updateProfileData(info,uploadImg,req,res){
	if (typeof uploadImg != 'undefined' && typeof uploadImg != undefined){
		users.findOneAndUpdate({"accessToken":info.accessToken},{$set:{"profileImage":uploadImg,"firstName":info.firstName,"lastName":info.lastName,"mobileNumber":info.mobileNumber,"info":info.dob}},(err,response)=>{
			if (err) {
				res.json({status:false,message:"Failed"})
			}
			else
			{
				res.json({status:true,message:"profile updated Successfully"})
			}
		})
	}
}

router.post("/deleteMyAccount",(req,res,next)=>{
	let data = req.body;
	
	users.findOneAndUpdate({"accessToken":data.accessToken},{$set:{"deleteStatus":1}},(err,response)=>{
		if(err){
			res.json({status:false,message:"Failed"})
		}
		else{
		    res.json({status:true,message:"Your account is deleted Successfully"})
		}
	})
})

router.post("/getUserList",(req,res,next)=>{
	let data = req.body;
	users.find({"accessToken":{$ne:data.accessToken}},{"mobileNumber":1,"firstName":1},(err,response)=>{
		if (err) {
			res.json({status:false,message:"Failed"})
		}
		else
		{
			if (response.length == 0) {
				res.json({status:false,message:"Contacts list is empty"})
			}
			else
			{
				res.json({status:true,message:"contact list",response})
			}
		}
	})
})

router.post("/readMsg",(req,res,next)=>{
	var data = req.body;
	var accessToken = data.accessToken;
	var messageStatus = data.messageStatus;
	var chatID = data.chatID;

	users.find({"accessToken":accessToken},(err,response)=>{
		if (err) {
			res.json({status:false,message:"Failed"})
		}
		else
		{
			if (response.length == 0) {
				res.json({status:false,message:"No data available"})
			}
			else
			{
				let myId = response[0].myId;
				chats.findOneAndUpdate({$and:[{"messageStatus":0},{"receiverId":myId},{"senderId":chatID}]},{$set:{messageStatus:1}},(err,respUpdate)=>{
					if (err) {
						res.json({status:false,message:"Failed"})
					}
					else
					{
						res.json({status:true,message:"messageRead"})
					}
				})

			}
		}
	})

})

module.exports = router;