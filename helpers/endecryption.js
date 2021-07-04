// var CryptoJS  = require('crypto-js');
var crypto = require('crypto');


exports.encrypt = function (txt){
    var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update(txt, 'utf8', 'hex')
    return mystr += mykey.final('hex');
}

exports.decrypt = function(txt){
    var mykey = crypto.createDecipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update(txt, 'hex', 'utf8')
    return mystr += mykey.final('utf8');
}

