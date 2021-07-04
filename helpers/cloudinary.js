const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name : 'deojh1eu2' ,
	api_key : '932338749627413',
	api_secret : 'dtV7jLgyIMcr88Ohh4pvsry2Yfg'
})

module.exports = {
	uploadImage : function(imageName,callback){
		cloudinary.v2.uploader.upload(
			imageName,{
				folder:'insta',
				use_filename : true
			},
			function(error,result){
				callback(result)
			}
		)
	}
}