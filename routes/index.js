var express = require('express');
var router = express.Router();
var authRouter = express.Router();
// var userController = require('../controllers/users');
var itemController = require('../controllers/items');
var userController = require('../controllers/users');
var bookingController = require('../controllers/booking');
var middleware = require('./middleware');
var Client = require('node-rest-client').Client;
var user = 'jim';
var services=['Web developer','Tutor','Errands','Photographer','Chef'];

router.get(['/'],function(req,res,next) {
        res.render("splashScreen",{firstName:"None"});
    });
router.get(['/home'],function(req,res,next) {
        res.render("index",{firstName:"None"});
    })
router.get(['/seekerHome'],function(req,res,next) {
          res.render("seekerHome",{firstName:"None"});
  });

router.get(['/login','/logout'],function(req,res,next) {
    res.render("login");
});

router.get('/register', function(req, res, next) {
    res.render('registerSeeker',{services:services});
});

router.post('/authenticate', function(req, res, next) {
    console.log(req.body);
    var loginType = req.body.loginType;
    var email = req.body.email;
    var password = req.body.password;
    userController.loginUser(email, password, loginType,function(token) {
        if(token.token) {
            req.session.token = token.token;
            req.session.user = token.customId;
            if ((token.loginType).toUpperCase() == 'Provider'.toUpperCase()){
              console.log(token.loginType);
              res.redirect('/providerHome/'+token.firstName);
            }else if ((token.loginType).toUpperCase() == 'Seeker'.toUpperCase()){
              console.log(token.loginType);
              res.redirect('/seekerHome/'+token.firstName);
            }else if (token.loginType == 'invalid'){
                res.render('login',{message:'Please check your login type.'});
            }
            console.log(token);
        } else {
            res.render('login', {message: 'Please check your login credentials.'});
        }
    });
});

router.get('/seekerHome/:firstName',middleware.isAuthenticated,function(req,res,next) {
    console.log(req.params.firstName);
    res.render("seekerHome",{firstName: req.params.firstName});
  });
router.get('/providerHome/:firstName',middleware.isAuthenticated,function(req,res,next) {
    bookingController.getProviderBookings(req.params.firstName,function(result){
        console.log(result);
        if (result.status == 'success'){
            res.render('providerHome',{firstName:req.params.firstName,bookings:result.results});
        }else{
            console.log('error');
            res.render('login',{message: "Please try again."});
        }
    });

});




router.post('/register', function(req, res, next) {
    var username = req.body.email;
    var email = req.body.email;
    var password = req.body.password;
    var firstName = req.body.first_name;
    var lastName = req.body.last_name;
    var street1 = req.body.street1;
    var city = req.body.city;
    var state = req.body.state;
    var zipcode = req.body.zipcode;
    var description = req.body.selfDesc;
    var registerType = 'seeker';
    var lat = '41.8821804';
    var long = '-87.64050429999998';
    var interests="";
    var otherInterests="";
    var expertiseLevel={};
    if(req.body.serviceOptions){
        if ((req.body.serviceOptions).length != 0) {
            registerType = 'provider';
            interests = req.body.serviceOptions;
            if (interests.length > 0) {
                for (var i=0;i<interests.length;i++) {
                    if(interests[i].toUpperCase() == 'web'.toUpperCase()){
                        expertiseLevel[interests[i]] = req.body[interests[i]];
                    }else{
                        expertiseLevel[interests[i]] = req.body[interests[i]+'Options'];
                    }
                }
                otherInterests = req.body.OtherInterests;
                otherInterests=otherInterests.trim();

            }
        }
    }
    description=description.trim();
    console.log(email,username,password,firstName,lastName,street1,city,state,zipcode,description,registerType,expertiseLevel,otherInterests,interests,lat,long);
    userController.createUser(email,username,password,firstName,lastName,street1,city,state,zipcode,description,registerType,expertiseLevel,otherInterests,interests,lat,long,function(result) {
        if(result == 'Success'){
            res.render('login',{message: 'Log in with your email address now.'});
        }else{
            res.render('login',{message: "Please try registering again. Some error on our side."});
        }

    });
});

router.get('/logout',function(req,res,next){
    req.session.user="NoUser";
    req.session.token="";
    // console.log(req.session.user);
    res.redirect('/login');
});
module.exports = router;
