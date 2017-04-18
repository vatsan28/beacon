// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    street1: String,
    city: String,
    state: String,
    zipcode: String,
    description: String,
    registerType: String,
    expertiseLevel: Object,
    otherInterests: String,
    interests: Object,
    lat:String,
    long:String
}));
