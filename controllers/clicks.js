var Clicks = require('../models/clicks');
var Button = require('../models/button');
var User = require('../models/user');
var express = require('express');
var userController = require('../controllers/users');
var buttonController = require('../controllers/buttons');
var sendgrid  = require('sendgrid')('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');


exports.createNewClick = function(deviceId,buttonDetail,cb){
    var status={};
    console.log("button details passed:");
    console.log(buttonDetail);
    var newClick = new Clicks;
    newClick.buttonDetail = buttonDetail[0]._id;
    newClick.ownerDetail = buttonDetail[0].owner;
    newClick.status = "Initiated";
    console.log(newClick);
    newClick.save(function(err){
        if (err) {
            console.log("Error at click controller at line 18.");
            console.log(err);
            status.code=0;
            cb(status);
        } else{
            console.log("New click created");
            Clicks.find({buttonId: buttonDetail._id,status:"Initiated"}).populate('buttonDetail ownerDetail').exec(function(err,docs){
                if (err)
                {

                    console.log("Error at line 23 in clicks controller.");
                    console.log(err);
                    status.code = 0;
                    cb(status);
                }else {
                    console.log("Button populated and the details are:"+docs);
                    Clicks.update({
                        buttonId: buttonDetail._id,
                        status: "Initiated"
                    }, {$set: {status: "Created"}}, function (err) {
                        if (err) {
                            console.log("Error at line 30 in clicks controller.");
                            console.log(err);
                            status.code = 0;
                            cb(status);
                        } else {
                            status.code = 1;
                            console.log("Click populated for:"+docs[0].ownerDetail.firstName);
                            cb(status);
                        }
                    });
                }
            });
        }
    });
}


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
