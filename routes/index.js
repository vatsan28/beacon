var express = require('express');
var router = express.Router();
var authRouter = express.Router();
// var userController = require('../controllers/users');
var itemController = require('../controllers/items');
var userController = require('../controllers/users');
var middleware = require('./middleware');
var Client = require('node-rest-client').Client;
var user = 'jim';
var services=['Web developer','Tutor','Errands','Photographer','Chef'];

router.get(['/','/login'],function(req,res,next) {
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
              res.redirect('/providerHome/'+token.customId);
            }else if ((token.loginType).toUpperCase() == 'Seeker'.toUpperCase()){
              console.log(token.loginType);
              res.redirect('/seekerHome/'+token.customId);
            }
        } else {
            res.render('login', {message: 'Please check your login credentials.'});
        }
    });
});

router.post('/register', function(req, res, next) {
    console.log(req.body);
    // var username = req.body.username;
    // var email = req.body.email;
    // var password = req.body.password;
    // var firstName = req.body.first_name;
    // var lastName = req.body.last_name;
    // var street1 = req.body.street1;
    // var street2 = req.body.street2;
    // var city = req.body.city;
    // var state = req.body.state;
    // var zipcode = req.body.zipcode;
    // var loginType = req.body.type;
    //
    // userController.createUser(email, password, firstName, lastName, street1, street2, city, state, zipcode, loginType,function(result) {
    //     res.render('login');
    // });
    res.render('login');
});

router.get('/logout',function(req,res,next){
    req.session.user="NoUser";
    req.session.token="";
    // console.log(req.session.user);
    res.redirect('/login');
});
module.exports = router;
