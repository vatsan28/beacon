// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Button', new Schema({
  partNo: String,
  quantity: Number,
  owner: {type: Schema.ObjectId, ref: 'User'},
  deviceId: String,
  description: String,
  imagePath: String,
  location: String,
  lastClicked: {type: Date},
  created: {type: Date, default: Date.now},
  totalClicks: {type: Number,default: 0}
}));
