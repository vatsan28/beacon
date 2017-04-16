var express = require('express');
var router = express.Router();
var authRouter = express.Router();
// var userController = require('../controllers/users');
var itemController = require('../controllers/items');
var middleware = require('./middleware');
var Client = require('node-rest-client').Client;
var user = 'jim';


router.get('/',function(req,res,next) {
          res.render("login");
  });

router.get('/register', function(req, res, next) {
    res.render('registerSeeker');
});

router.get('/seekerHome',function(req,res,next) {
          res.render("seekerHome");
  });




module.exports = router;
