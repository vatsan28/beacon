// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Booking', new Schema({
  ReqId: Number,
  reqTime : {type: Date, default: Date.now},
  Requester : String,
  ReqService: String,
  Amount: String,
  provider:String,
  status:String
})
);
