var User = require('../models/user');
var Bookings = require('../models/booking');
var bCrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var isValidPassword = function(dbpassword, password){
    return bCrypt.compareSync(password, dbpassword);
}

exports.createUser = function (email,username,password,firstName,lastName,street1,city,state,zipcode,description,registerType,expertiseLevel,otherInterests,interests,cb) {
  var newUser = new User();
  newUser.username = username;
  newUser.email = email;
  newUser.password = createHash(password);
  newUser.firstName = firstName;
  newUser.lastName = lastName;
  newUser.street1 = street1;
  newUser.city = city;
  newUser.state = state;
  newUser.zipcode = zipcode;
  newUser.registerType= registerType;
  newUser.description = description;
  newUser.expertiseLevel = expertiseLevel;
  newUser.otherInterests = otherInterests;
  newUser.interests = interests;
  newUser.save(function(err){
    if (err) {
      cb('Error');
    } else {
      cb('Success');
    }
  });
}

exports.getUsernamebyId = function(userId,cb){
 var result = {};
  User.find({
   _id: userId
 },function(err,user){
   if (err){
     console.log(err);
     result.code = 1;
     cb(result);
   }else {
     console.log(user);
     result.code = 0;
     result.firstName = user[0].firstName;
     console.log(result);
     cb(result);
   }
 });
}

exports.loginUser = function (email, password, loginType,cb) {

  User.findOne({
    email: email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      var message = {};
      message.success = false;
      message.body = 'Authentication failed. User not found.';
      cb(message)
    } else if (user) {

      // check if password matches
      if (!isValidPassword(user.password, password)) {
        var message = {};
        message.success = false;
        message.body = 'Authentication failed. Wrong password.';
        cb(message);
      } else {
          var message = {};
        // if user is found and password is right
        // create a token
        var token = jwt.sign({user: user._id}, 'ilovescotchyscotch', {
          expiresInMinutes: 45000// expires in 24 hours
        });

        //Check for type
          if ((loginType).toUpperCase() == 'Provider'.toUpperCase()){
              if((user.registerType).toUpperCase() == 'PROVIDER'){
                  message.loginType = 'Provider';
              }else{
                message.loginType='invalid';
              }
          }else if ((loginType).toUpperCase() == 'Seeker'.toUpperCase()) {
              if (((user.registerType).toUpperCase() == 'SEEKER') || ((user.registerType).toUpperCase() == 'PROVIDER')){
                  message.loginType = 'Seeker';
              }else{
                  message.loginType='invalid';
                  console.log(user.registerType);
              }
          }

        // return the information including token as JSON

        message.customId = user._id;
        message.success = true;
        message.body = 'Success';
        message.token = token;
        message.firstName = user.firstName;
        cb(message);
      }
    }
  });
};
exports.searchUserFromService=function(searchTerm,cb){
  User.find({interests:searchTerm},function(err,user){
    var result = {};
    if (err){
      console.log(err);
      result.code = 1;
    }else{
      console.log(user);
      result.results = user;
      result.code = 0;
    }

    cb(result);
  });
};
exports.getUserContact = function(userId,cb){
  User.findOne({_id: userId},function(err,user){
    var result = {};
    if (err) {
      console.log(err);
      result.firstName = "";
      result.lastName = "";
      result.street1 = "";
      result.street2 = "";
      result.city = "";
      result.state = "";
      result.zipcode = "";
      result.code = 0;
      cb(result);
    }
    result.firstName = user.firstName;
    result.lastName = user.lastName;
    result.street1 = user.street1;
    result.street2 = user.street2;
    result.city = user.city;
    result.state = user.state;
    result.zipcode = user.zipcode;
    result.code = 1;
    cb(result);
  });
}
