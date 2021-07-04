// required modules
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require('path');
const ejs = require('ejs');


// host and port
const hostname = '127.0.0.1';
const port = 3000;

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server)

// model
var users = require('./model/users');
var chats = require('./model/chat');
var chatDetails = require('./model/chatDetails');



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname + '/public')))

// set view engine

app.set('view engine','ejs');


// db connection
mongoose.connect("mongodb://localhost:27017/chatWorld", {
  useNewUrlParser : "true",
})
mongoose.connection.on("error", err => {
  console.log("err", err)
})
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected")
})

// Routers
var userRouter = require('./routes/user');

app.use('/user',userRouter);


// senderId,receiverId,message,image
io.on('connection', socket => {
	socket.on('getOnline',function(data){
		var accessToken = data.accessToken;
		var socketID = socket.id;
		users.findOneAndUpdate({"accessToken":accessToken},{$set:{"socketID":socketID}},(err,response)=>{
			if (err) {
				console.log(err)
			}
		})
	})

    socket.on('sendMessage', function(data) => {
    	var senderId = data.senderId;
    	var receiverId = data.receiverId;
    	var message = data.message;
    	users.find({"_id":receiverId},{"accessToken":1,"mobileNumber":1},(err,response)=>{
    		if (err) {
    			console.log(err)
    		}
    		else
    		{
    			var socketID = response[0].socketID;
    			var accessToken = response[0].accessToken;
    			socket.to('receiveMessage',{receiverId : receiverId, senderId : senderId, message: message});

    			var findSender = {"_id":senderId};
    			var findReceiver = {"_id":receiverId};

    			users.find(findSender,{"firstName":1},(err,senderRes)=>{
    				var user = senderRes[0].firstName;
    				if (err) {
    					console.log(err)
    				}
    				else
    				{
    					users.find(findReceiver,{firstName:1},(err,receiverRes)=>{
    						if (err) {
    							console.log(err)
    						}
    						else
    						{
    							var senderName; = senderRes[0].firstName;
    							var receiverName = receiverRes[0].receiverName;

    							let chatData = {};
    							chatData.senderName = senderName;
    							chatData.receiverName = receiverName;
    							chatData.senderId = senderId;
    							chatData.receiverId = receiverId;
    							chatData.message = message;


    							chats.create(chatData,(err,response)=>{
    								if (err) {
    									console.log(err)
    								}
    								else
    								{
    									chatDetails.find({$and:[{"senderId":senderId},{"receiverId":receiverId}]},(err,respData)=>{
    										if (err) {
    											console.log(err)
    										}
    										else
    										{
    											if(respData.length == 0){
    												chatData.lastMsgBy = senderId;
				    									chatDetails.create(chatData,(err,resChatData)=>{
				    										if (err) {
				    											console.log(err)
				    										}
				    										else
				    										{
				    											console.log('Success')
				    										}
				    									})
    											}
    											else
    											{
    												chatDetails.findOneAndUpdate({$and:[{"senderId":senderId},{"receiverId":receiverId}]},{$set:{"message":message,lastMsgBy:senderId}},(err,response)=>{
    													if (err) {
    														console.log(err)
    													}
    													else
    													{
    														console.log("success")
    													}
    												})
    											}
    										}
    									})
    								}
    							})
    						}
    					})
    				}

    			})
    		}
    	})
        // io.emit('chat', message)
  })
})



// start the server
server.listen(port,hostname,()=>{
	console.log(`Server running at http://${hostname}:${port}/`);
})