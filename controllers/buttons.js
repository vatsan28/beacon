var Button = require('../models/button');
var Bookings = require('../models/booking');
var bookingController = require('../controllers/booking');
exports.getButtons = function (username, cb) {
  Button.find({owner: username}).exec(function(err, docs) {
      cb(docs);
  });
};

exports.addButton = function (owner, deviceId, partNo, description, orderQuantity, imagePath, location) {
  var newButton = new Button();
  var d = new Date();
  newButton.partNo = partNo;
  newButton.deviceId = deviceId;
  newButton.owner = owner;
  newButton.quantity = orderQuantity;
  newButton.description = description;
  newButton.location = location;
  newButton.imagePath = imagePath;
  newButton.lastClicked = "";
  newButton.save(function(err) {
    if (err) {
      console.log(err);
    } else{
      Button.find({deviceId:deviceId,partNo:partNo}).populate('owner').exec(function(err,docs){
        console.log("Button created for: "+docs[0].owner.firstName);
      });
    }
  });
}


exports.getButtonsByTotalClicksByUserId = function(userId,cb){
  Button.find({owner: userId}).sort({"totalClicks":-1}).exec(function(err,docs) {
    if (err){
      console.log(err);
      cb(docs);
    }else {
      //console.log(docs);
      cb(docs);
    }
  });
};

exports.getButtonsByUserId = function(user_id,cb){
  Button.find({owner : user_id}).exec(function(err,docs){
    var i=0;
    var result=[];
    while (i < docs.length)
    {
      var temp={};
      temp.partNo = docs[i].partNo;
      temp.quantity= docs[i].quantity;
      temp.owner = docs[i].owner;
      temp.deviceId = docs[i].deviceId;
      temp.description = docs[i].description;
      temp.imagePath= docs[i].imagePath;
      temp.lastClicked= docs[i].lastClicked;
      temp.created = docs[i].created;
      temp.totalClicks = docs[i].totalClicks;
      if (docs[i].totalClicks == '0')
      {
        temp.Yes = "0";
      }else{
        temp.No = "0";
      }
      i++;
      result.push(temp);
      //console.log(result);
    }
     cb(result);
  });
}

exports.getButtonByDevice = function (deviceId, cb) {
  Button.find({deviceId: deviceId}).exec(function(err, doc) {
      cb(doc[0]);
  });
}

exports.removeButton = function (buttonId) {
  Button.find({'deviceId' : buttonId}).remove(function(err) {
    if (err) console.log(err);
  });
}

exports.checkButtonExists = function(deviceId, cb) {
  Button.find({deviceId: deviceId}).exec(function(err, docs) {
    if (err) {
      var result = {};
      result.code = 0;
      result.msg = 'DEVICE ID ERROR';
      cb (result);
    } else if (docs.length > 0) {
      var result = {};
      result.code = 1;
      result.msg = 'DEVICE IS REGISTERED';
      cb (result);
    } else {
      var result = {};
      result.code = 0;
      result.msg = 'NO RESULT';
      cb (result);
    }
  });
}

exports.updateButtonConsumed = function(deviceId,cb){
  var result = {};
  Button.update({
  deviceId : deviceId
  }, {
    $set: {
      lastClicked: new Date()
    },
    $inc: {
      totalClicks: 1
    }
  },function(err){
    if (err) {
      console.log("Button find error in line 111");
      console.log(err);
      result.code = 0;
    }
    else {
      console.log("Updated button details.");
      Button.find({deviceId: deviceId}).exec(function (err, docs) {
        if (err) {
          console.log("Button find error in line 126");
          console.log(err);
          result.code = 0;
        } else {
          console.log("Button found. Gonna create new click");
          console.log(docs);
          clickController.createNewClick(deviceId, docs, function (status) {
            if (status.code == 0) {
              result.code = 0;
            } else if (status.code == 1) {
              result.code = 1;
              console.log(result);
              cb(result);
            }
          });
        }
      });
    }
  });
  console.log(result);
  cb(result);
};

exports.getTopButtons=function(userId,topItemsQty,cb){
  var result = {};
  Button.find({owner: userId}).sort({"totalClicks":-1}).limit(topItemsQty).exec(function(err,docs){
    if (err){
     console.log(err);
      result.code = 1;
      cb(result);
    } else{
      result.code = 0;
      console.log(docs);
      cb(docs);
    }
  });
}