// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
    email: String,
    password: String,
    company: String,
    account: String,
    firstName: String,
    lastName: String,
    attention: String,
    street1: String,
    street2: String,
    city: String,
    state: String,
    zipcode: String,
    admin: Boolean
}));
