// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Items', new Schema({
  partNo: String,
  owner: String, //If status is available then last used owner else if status is unavailable then the owner is the current user.
  lockerId: String,
  description: String,
  imagePath: String,
  lastPicked: {type: Date},
  created: {type: Date, default: Date.now},
  status : String, //Available or Unavailable
}));
