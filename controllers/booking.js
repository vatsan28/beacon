var bookings = require('../models/booking');
var Button = require('../models/button');
var User = require('../models/user');
var express = require('express');
var userController = require('../controllers/users');
var buttonController = require('../controllers/buttons');
// var sendgrid  = require('sendgrid')('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');


exports.createNewBooking = function(requester,reqService,amount,provider,cb){
    console.log("Booking details passed:");
    console.log(requester,reqService,amount,provider);
    var newBooking= new bookings;
    newBooking.ReqId = Math.random();
    // newBooking.reqTime = ;
    newBooking.Requester = requester;
    newBooking.ReqService = reqService;
    newBooking.Amount = amount;
    newBooking.provider = provider;
    newBooking.status = 'live';
    newBooking.save(function (err) {
        if (err){
            console.log(err);
            cb('Error');
        }else{
            cb('Success');
        }
    });
}

exports.getProviderBookings = function(fname,cb){
  var result={};
  console.log("Find bookings for "+fname);
  bookings.find({'provider':fname},function(err,user){
      if(err){
          console.log(err);
          result.status='error';
      }else{
          console.log(user);
          result.results = user;
          result.status='success';
      }
      cb(result);
  });
};

exports.getClickInDateRange=function(userId,startDate,endDate,cb) {
    var status = {};
    console.log("Fetching data for :" + userId);
        Clicks.find({
            ownerDetail: userId,status:'Created',
            buttonClickedAt: {"$gt": startDate, "$lt": endDate}
        }).populate('buttonDetail ownerDetail').exec(function (err, docs) {
            if (err) {
                console.log("Date fetch error");
                console.log(err);
                status.code = 0;
                cb(status);
            } else {
                console.log(docs);
                status.code = 1;
                status.clicks = docs;
                console.log(docs[0].buttonDetail.partNo);
                cb(status);
            }
        });
    };
