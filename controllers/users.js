var User = require('../models/user');
var Clicks = require('../models/clicks');
var bCrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var isValidPassword = function(dbpassword, password){
    return bCrypt.compareSync(password, dbpassword);
}

exports.createUser = function (email, password, firstName, lastName, street1, street2, city, state, zipcode, loginType,cb) {
  var newUser = new User();

  // newUser.username = username;
  newUser.email = email;
  newUser.password = createHash(password);
  newUser.firstName = firstName;
  newUser.lastName = lastName;
  newUser.street1 = street1;
  newUser.street2 = street2;
  newUser.city = city;
  newUser.state = state;
  newUser.zipcode = zipcode;
  newUser.loginType = loginType;
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
              if((user.type).toUpperCase() == 'PROVIDER'){
                  message.loginType = 'Provider';
              }
          }else if ((loginType).toUpperCase() == 'Seeker'.toUpperCase()) {
              if ((user.type).toUpperCase() in ['SEEKER','PROVIDER'] ){
                  message.loginType = 'Seeker';
              }
          }

        // return the information including token as JSON

        message.customId = user._id;
        message.success = true;
        message.body = 'Success';
        message.token = token;
        cb(message);
      }
    }
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
