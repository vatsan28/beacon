var Item = require('../models/items');

/* Function to add item to the database. Parameters required:
      1. part number.
      2. user name.
      3. locker id.
      4. description.
      5. imagepath.
 */

exports.addItem = function (partNo, user, locker, description, imagePath,cb) {
  var newItem = new Item();
  var result = {};
  var d = new Date();
  newItem.partNo = partNo;
  newItem.owner = "jim";
  newItem.description = description;
  newItem.imagePath = imagePath;
  newItem.lockerId = locker;
  newItem.lastPicked = "";
  newItem.status = "Available";
  newItem.save(function(err) {
    if (err) {
      console.log(err);
      result.code = 1;
      cb(result);
    } else{
          console.log("Item created for Jim!");
          result.code = 0;
          cb(result);
    }
  });
};

/* Function to get total count of all items in the system.

 */

exports.getTotalItems=function(cb){
  var result = {};
  Item.find().count(function(e,count){
    if (e){
      console.log(e);
      result.code = 1;
      cb(result);
    }else {
      console.log(count);
      result.code = 0;
      result.count = count;
      cb(result);
    }
  });
};

/* Function to get total count of all checked out items from the system.
 */

exports.getTotalCheckedOutItems=function(cb){
  var result ={};
  Item.find({status:'Unavailable'}).count(function (err,count){
    if (err){
      console.log(err);
      result.code = 1;
      cb(result);
    }else {
      result.code = 0;
      result.count = count;
      cb(result);
    }
  });
};

/* Function to get total count of all checked out items by a particular user from the system. Parameters required:
      1. user name.
 */
exports.getTotalCheckedOutByUser=function(user,cb){
  var result ={};
  Item.find({status:'Unavailable',owner:user.toLowerCase()}).count(function (err,count) {
    if (err){
      console.log(err);
      result.code = 1;
      cb(result);
    }else {
      console.log(count);
      result.code = 0;
      result.count = count;
      cb(result);
    }
  });
};

/* Function to get all available items for a particular user from the system. Parameters required:
 1. user name.
 */
exports.getAllAvailableItemsByUser=function(user,cb){
  var result ={};
  Item.find({status: "Available",lockerId:{$ne: 'L0301'}}).exec(function(err,docs){
    if (err){
      console.log(err);
      result.code = 1;
      cb(result);
    }else {
      // console.log(docs);
      result.code = 0;
      result.docs = docs;
      cb(result);
    }
  });
};

/* Function to get all checked out items by a particular user from the system. Parameters required:
 1. user name.
 */
exports.getAllCheckedOutToolsByUser=function(user,cb){
  var result ={};
  Item.find({owner: user,status:'Unavailable',lockerId: {$ne: 'L0301'}}).exec(function(err,docs){
    if (err){
      console.log(err);
      result.code = 1;
      cb(result);
    }else {
      // console.log(docs);
      result.code = 0;
      result.docs = docs;
      cb(result);
    }
  });
};

/* Function to get all checked out items by a other users from the system. Parameters required:
 1. user name.
 */
exports.getAllCheckedOutToolsByOtherUsers=function(user,cb){
  var result ={};
  Item.find({owner: {$ne: user},status:'Unavailable'}).exec(function(err,docs){
    if (err){
      console.log(err);
      result.code = 1;
      cb(result);
    }else {
      // console.log(docs);
      result.code = 0;
      result.docs = docs;
      cb(result);
    }
  });
};

exports.getMissingTools = function(user,cb){
  var result ={};
  Item.find({owner: {$ne: user},status:'Missing'}).exec(function(err,docs){
    if (err){
      console.log(err);
      result.code = 1;
      cb(result);
    }else {
      // console.log(docs);
      result.code = 0;
      result.docs = docs;
      cb(result);
    }
  });
};
/* Function to get part details given part number. Parameters required:
  1. part number.
*/
exports.getItemDetailsByPartNo=function(partNo,cb){
  var result ={};
  Item.find({partNo:partNo}).exec(function (err,docs) {
    if (err){
      console.log(err);
      result.code = 1;
      cb(result);
    }else {
      // console.log(docs);
      result.code = 0;
      result.docs = docs;
      cb(result);
    }
  });
};

/* Function to update the dispensed item in the system. Parameter:
  1. Locker id.
 */
exports.updateItemDispensed = function(lockerId,cb){
  console.log("Got message from server to update "+lockerId);
  var i=0;
  var result = {};
    Item.update({
      'lockerId': lockerId,
      'status':{$ne: 'Missing'}
    },{
      '$set':{
        'status':'Unavailable',
        'owner':"jim"
      }
    },function(err,docs){
      if (err){
        console.log("Error at line 159 item controller.");
        console.log(err);
        result.code = 1;
        cb(result);
      }else {
        console.log("All good for : "+lockerId);
        // console.log(docs);
        result.code = 0;
        result.lockerId = lockerId;
        cb(result);
      }
    });
};


/* Function to update the returned item in the system. Parameter:
 1. Locker id.
 */

exports.updateItemReturned = function(lockerId,cb){
  console.log("Got message from server to update "+lockerId);
  var result = {};
  console.log(lockerId);
    Item.update({
      'lockerId': lockerId,
      'status':{$ne: 'Missing'}
    },{
      '$set':{
        'status':'Available',
        'owner':""
      }
    },function(err,docs){
      if (err){
        console.log("Error at line 188 item controller.");
        console.log(err);
        result.code = 1;
        cb(result);
      }else {
        console.log("All good for : "+lockerId);
        // console.log(docs);
        result.code = 0;
        result.lockerId = lockerId;
        cb(result);
      }
    });
};

//Function to get the locker id given a part number: Parameter : part number.

exports.getLockerId = function(partNo,cb){
  var result = {};
  console.log("Fetching locker Id for part :"+partNo);
  Item.find({partNo: partNo},{lockerId:1}).exec(function (err,docs) {
    if (err){
      console.log("Error at line 206 item controller.");
      console.log(err);
      result.code = 1;
      cb(result);
    }else{
      console.log("All good");
      console.log("------------------");
      // console.log(docs);
      console.log("------------------");
      result.code = 0;
      console.log(result);
      result.lockerId = docs[0].lockerId;
      cb(result);
    }
  });
};

/* Function to get details about the work order tools. For now it is set as the glove in locker L0301.
  Parameter: part number.
*/
exports.getWorkOrderTool = function(user,cb){
  var result = {};
  console.log("Fetching work order tool- Gloves if available.");
  Item.find({lockerId: 'L0301',status:'Available'}).exec(function(err,docs){
    if (err){
      console.log("Error at line 228 item controller.");
      console.log(err);
      result.code = 1;
      cb(result);
    }else{
      console.log("Work order tool:");
      // console.log(docs);
      result.code=0;
      result.docs = docs;
      cb(result);
    }
  });
};

/* Function to get details about the work order tools. For now it is set as the glove in locker L0301. This is for all tools view.
 Parameter: part number.
*/


exports.getWorkOrderToolForAllItems = function(user,cb){
  var result = {};
  console.log("Fetching work order tool- Gloves if available.");
  Item.find({lockerId: 'L0301'}).exec(function(err,docs){
    if (err){
      console.log("Error at line 247 item controller.");
      console.log(err);
      result.code = 1;
      cb(result);
    }else{
      console.log("Work order tool:");
      // console.log(docs);
      result.code=0;
      result.docs = docs;
      cb(result);
    }
  });
};
/* Function to update dispense of the work order tool. For now it is set as the glove in locker L0301.
  Parameter: part number.
*/
exports.workOrderItemUpdate = function(partNo,cb){
  console.log("Fetching work order tool- Gloves if available.");
  var result = {};
  Item.update({partNo: partNo},{$set:{status:'Unavailable'}},function(err,docs){
    if (err){
      console.log("Error at line 266 item controller.");
      console.log(err);
      result.code = 1;
      cb(result);
    }else{
      console.log("Updated work order tool:");
      // console.log(docs);
      result.code=0;
      result.docs = docs;
      cb(result);
    }
  });
};

/* Function to update return of the work order tool. For now it is set as the glove in locker L0301.
  Parameter: part number.
 */

exports.workOrderItemReturn= function(partNo,cb){
  console.log("Fetching work order tool- Gloves if available.");
  var result = {};
  Item.update({partNo: partNo},{$set:{status:'Available'}},function(err,docs){
    if (err){
      console.log("Error at line 286 item controller.");
      console.log(err);
      result.code = 1;
      cb(result);
    }else{
      console.log("Updated work order tool:");
      // console.log(docs);
      result.code=0;
      result.docs = docs;
      cb(result);
    }
  });
};


exports.updateMissingTool = function(partNo,cb){
  console.log("Update missing status of tool :"+partNo);
  var result ={};
  Item.update({partNo: partNo},{$set:{status:"Missing"}},function (err,docs) {
    if (err){
      console.log("Error at line 350 item controller.");
      console.log(err);
      result.code = 1;
      cb(result);
    }else{
      console.log("Updated missing tool:");
      // console.log(docs);
      result.code=0;
      result.docs = docs;
      cb(result);
    }
  });
};



exports.updateMissingToolReplaced = function(partNo,cb){
  console.log("Update available(missing) status of tool :"+partNo);
  var result ={};
  Item.update({partNo: partNo},{$set:{status:"Available"}},function (err,docs) {
    if (err){
      console.log("Error at line 350 item controller.");
      console.log(err);
      result.code = 1;
      cb(result);
    }else{
      console.log("Updated missing tool:");
      // console.log(docs);
      result.code=0;
      result.docs = docs;
      cb(result);
    }
  });
};














