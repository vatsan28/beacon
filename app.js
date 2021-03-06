/*
The main app file.
Contains all the socket message handling, api route requests and basic server setups.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config/vars');
var mongoose = require('mongoose'); //The node module for the database.
var jwt = require('jsonwebtoken');
var session = require('express-session');
var debug = require('debug')('jwtokens:server');
var http = require('http'); // Node module for Http requests. Needed as the app has socket communication between back end and front end.
var port = normalizePort(process.env.PORT || '80');
var itemController = require('./controllers/items'); // The items controller.
var userController = require('./controllers/users'); // The users controller.
var bookingController = require('./controllers/booking');
var util = require('util');
var Particle = require('particle-api-js'); // Node module for the particle library.
var open = require("open");
var Client = require('node-rest-client').Client;
var Swag = require('swag');
var middleware = require('./routes/middleware');
var routes = require('./routes/index');// Routing other connections to the index.js file.
var app = express();
var server =require("http").Server(app);// For setting up the server.
var io = require('socket.io')(server);// Socket purposes.
var Handlebars = require('handlebars');//View engine setup.
var particle = new Particle();

// Server listens to connections.
server.getConnections(function(err,count){
    console.log("Server listening.");
});


// Basic server setup.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//Connect to the database.
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
app.set('superSecret', config.secret);
app.set('port', port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('trust proxy', 1);

//Register helpers for view engine. Might be used in the future versions.
Swag.registerHelpers(Handlebars);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname + '/public')));
app.use(session({ secret: 'keyboard cat', resave: false,saveUninitialized:true,cookie: { maxAge: 360000 }}));

app.use('/', routes);


//Important variables to be used throughout the app.
var user = "jim";
io.on('connection',function(socket){
    socket.on('seekerQuery',function(query){
        console.log(query);
        if (query.searchTerm == 'Web Developer'){
            query.searchTerm = 'Web';
        }
        userController.searchUserFromService(query.searchTerm,function(result){
            if (result.code == 0){
                if (result.results){
                    console.log(result.results);
                    var users = result.results;
                    var queryresult=[];
                    for (var i=0;i<users.length;i++){
                        var tempObj = {};
                        tempObj['fname']=users[i].firstName;
                        tempObj['lname']=users[i].lastName;
                        tempObj['description']=users[i].description;
                        tempObj['img'] = '/images/'+users[i].firstName.toLowerCase()+'.jpg';
                        tempObj['totalusers'] = Math.floor(Math.random() * 100) + 1;
                        tempObj['recommend'] = Math.floor(Math.random() * tempObj['totalusers']) + 1;
                        tempObj['tag'] = query.searchTerm;
                        tempObj['lat']=users[i].lat;
                        tempObj['long']=users[i].long;
                        console.log(tempObj);
                        queryresult.push(tempObj);
                    }
                    socket.emit('seekerQueryResults',{result: queryresult});
                }
            }else{
                console.log("Error in query fetch");
            }
        });
    });

    // socket.on('directToLogin',function(message){
    //     if (message.uppercase() == 'SEEKER'){
    //
    //     }else if (message.uppercase( == 'PROVIDER')){
    //
    //     }
    // });

    socket.on('bookRequest',function(data){
        console.log("Received new booking: ",data.searchTerm);
        data.msg = 'Hope this works out for you! Thanks';
        var name;
        if (data.searchTerm.reqName){
            userController.findUserFromEmail(data.searchTerm.reqName,function(result){
                if (result.result == 'success'){
                    name= result.name;
                    bookingController.createNewBooking(name,data.searchTerm.reqService,data.searchTerm.amount,data.searchTerm.provider,function(result){
                        if (result == 'Success'){
                            console.log('Successful booking');
                            io.sockets.emit('newBookingRequest',{bookingInfo:data});
                        }else{
                            console.log('Unsuccessful booking');
                        }
                    });
                }else{
                    name='';
                }
            });
        }else{
            console.log("Error in fetching service name");
        }
    });

    socket.on('pendingRequests',function(data){
        console.log("Received new pending requests: ",data.searchTerm);
        var name;
        if (data.searchTerm){
            userController.findUserFromEmail(data.searchTerm,function(result) {
                if (result.result == 'success') {
                    name = result.name;
                    bookingController.fetchBookingsByUserName(name, function (result) {
                        if (result.result == 'success') {
                            console.log('Fetched requests');
                            // console.log(result.users);
                            var users = result.users;
                            var pendingResults = [];
                            for (var i = 0; i < users.length; i++) {
                                // console.log("------"+users[i]);
                                var amount=users[i].Amount;
                                var reqId=users[i].ReqId;
                                userController.getUserInfo(users[i].Requester, function (result) {
                                    // console.log(result);
                                    if (result.result != 'failure') {
                                        var tempObj = {};
                                        tempObj['fname'] = result.user.firstName;
                                        tempObj['lname'] = result.user.lastName;
                                        tempObj['img'] = '/images/' + result.user.firstName.toLowerCase() + '.jpg';
                                        tempObj['lat'] = result.user.lat;
                                        tempObj['long'] = result.user.long;
                                        tempObj['askingPrice'] = amount;
                                        tempObj['ReqId']=reqId;
                                        pendingResults.push(tempObj);
                                    } else {
                                        console.log("Error fetching user info");
                                    }
                                    // console.log(pendingResults);
                                    if (pendingResults.length == (i)){
                                        console.log("All fetched: " + pendingResults);
                                        io.sockets.emit('providerQueryResults', {result: pendingResults});
                                    }

                                });
                            }



                        } else {
                            // console.log(result);
                            console.log('Unsuccessful fetch');
                        }
                    });
                } else {
                    name = '';
                }
            });
        }
    });

    socket.on('updateRequest',function(data){
        console.log("Update request for "+data.searchTerm.ReqId);
        console.log("Update request for "+data.searchTerm.status);
        bookingController.updateRequest(data.searchTerm.ReqId,data.searchTerm.status,function(result){
            if (result=='success'){
                console.log('Update done');
            }else if (result == 'failure'){
                console.log('Update not done');
            }
        });
    })
    //On a dispensing item socket message, open the appropriate door.
    // socket.on("DispensingItem",function(data){
    //     console.log(data);
    //     //Fetch the locker id depending on the item.
    //     itemController.getLockerId(data.partNo,function(result){
    //         if (result.code == 0){
    //             if (result.lockerId.length != 0){
    //                 var locker = result.lockerId;
    //                 var lockerId = locker.substr(1,2);
    //                 var deviceLocation = locker.substr(3,2);
    //                 var doorType;
    //                 console.log(deviceLocation);
    //                 console.log(lockerId);
    //                 if (lockerId == "01"){
    //                     doorType = 'foam';
    //                     io.to(socket.id).emit('DeviceLocation',{deviceLocation: deviceLocation,doorType:doorType});
    //                 }else if (lockerId == "02"){
    //                     doorType = 'hinges';
    //                     io.to(socket.id).emit('DeviceLocation',{deviceLocation: deviceLocation,doorType:doorType});
    //                 }
    //
    //                 var message = "on"+(lockerId-1);
    //                 console.log(message);
    //                 //Invoking the particle photon function to open the door.
    //                 if (lockerId != "03"){
    //                     var fnPr = particle.publishEvent({ name: 'doorSignal', data: message, auth: access_token });
    //                     // var fnPr = particle.callFunction({ deviceId: deviceId_DoorController, name: 'led', argument: message, auth: access_token });
    //                 }else {
    //                     var fnPrLocker3  = particle.publishEvent({ name: 'doorSignal', data: message, auth: access_token });
    //                     // var fnPrLocker3 = particle.callFunction({ deviceId: deviceId_DoorController, name: 'led', argument: message, auth: access_token });
    //                 }
    //                 if (lockerId != "03"){
    //                     /*  -> If the door opening function is invoked properly, wait to listen to the door is open status from the door sensor and then change the message in the front end.
    //                      -> If the door isn't opening once, then try 3 times before aborting the process.
    //                      -> If the door opens, then for the 1st door(foam tools door),light up the LED for the correct item.
    //                      -> lightUpLed() is the function to light up the correct item.
    //                      */
    //                     fnPr.then(
    //                         function(response) {
    //                             console.log('Function called successfully:', response);
    //                             if (lockerId == "01"){
    //                                 console.log("Trying to open foam door---------------------------------------");
    //                             }
    //                             else if (lockerId == "02"){
    //                                 console.log("Trying to open hinges door---------------------------------------");
    //                             }
    //                         }, function(err) {
    //                             console.log('An error occurred:', err);
    //                             console.log("Could not open door");
    //                             io.sockets.emit("DoorClosed");
    //                         });
    //                     // var tempI = 0;
    //                     // // console.log("Purpose:"+data.purpose);
    //                     // // lightUpLed(doorType,deviceLocation,data.purpose);
    //                     // // while (tempI!=10){
    //                     // //     setTimeout(function(){lightUpLed(doorType,deviceLocation,data.purpose);},500);
    //                     // //     tempI++;
    //                     // // }
    //
    //                 }else if (lockerId == "03"){
    //                     /*
    //                         If it is the gloves door, then just assume the user replaces or puts back the item successfully and closes the door in 3 seconds.
    //                      */
    //                     fnPrLocker3.then(function(response){
    //                         console.log("Door opened",response);
    //                         console.log("All done");
    //                         if (data.purpose.toLowerCase() == "return"){
    //                             itemController.workOrderItemReturn(data.partNo,function(res){
    //                                 if (res.code == 0){
    //                                     console.log("Success in updating work order item.");
    //                                 }else{
    //                                     console.log("Error in updating work order item update.");
    //                                 }
    //                             });
    //                         }else if (data.purpose.toLowerCase() == "dispense") {
    //                             itemController.workOrderItemUpdate(data.partNo,function(res){
    //                                 if (res.code == 0){
    //                                     console.log("Success in updating work order item.");
    //                                 }else{
    //                                     console.log("Error in updating work order item update.");
    //                                 }
    //                             });
    //                         }
    //
    //                         setTimeout(function(){
    //                             console.log("Door closing now!!!");
    //                             io.sockets.emit("WorkOrderDoorCloseInReturn");
    //                         },3500);
    //                     },function(err){
    //                         console.log('An error occurred:', err);
    //                         console.log("Could not open work order door");
    //                         io.sockets.emit("WorkOrderDoorCloseInReturn");
    //                     });
    //                 } else {
    //                     console.log("Particle functions not working");
    //                 }
    //             }
    //             else{
    //                 console.log("Error with parsing locker for the item.");
    //             }
    //         }else{
    //             console.log("Error with fetching locker for the item.");
    //         }
    //     });
    // });
});


/* -> API requests to add item to the database.
   -> Essential parameters:
        1. event: This should be 'additem'.
        2. user: This should be the user variable declared. (jim for now).
        3. locker: This should be a valid locker id for the system to work properly. (Eg: L0103 - meaning 3rd locker and 1st position in that locker).
        4. partNo: part number of the item being added.
        5. description: A description of the item being added which will be displayed on the front end.
 */
app.post('/addBooking',function(req,res){
    console.log(req.body);
    var ReqId = req.body.reqId;
    var today = new Date();
    var reqTime = today;
    var requester = req.body.requester;
    var reqService = req.body.reqService;
    var amount = req.body.amount;
    var provider = req.body.provider;
    bookingController.createNewBooking(ReqId,reqTime,requester,reqService,amount,provider,function(result){
        console.log(result);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        res.write("All ok.");
        res.end();
    });
});

app.post('/newBooking',function(req,res){
    console.log(req.body);
    var data={};
    data.reqName = 'Srivatsan';
    data.providerName = 'Shalman';
    data.amount = 20;
    data.msg = 'Hope this works out for you! Thanks';
    io.sockets.emit('newBookingRequest',{bookingInfo:data});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    res.write("All ok.");
    res.end();
});
app.post('/addItem',function(req,res,next){
    var user = 'jim';
    var message;
    if (req.body.event == "addItem"){
        if (req.body.partNo){
            if (req.body.user){
                if (req.body.user == user){
                    if (req.body.locker){
                        var partNo = req.body.partNo;
                        var user = user.toLowerCase();
                        var locker =req.body.locker;
                        var description = req.body.description;
                        var client = new Client();
                        client.get("https://m.grainger.com/api/v2/products/"+partNo,function(data,response) {
                            var imagePath;
                            if (data) {
                                if (data.categoryData) {
                                    if (data.categoryData.pictureUrl600) {
                                        imagePath = data.categoryData.pictureUrl600;
                                    }
                                    else {
                                        imagePath = "";
                                    }
                                }
                                else {
                                    imagePath = "";
                                }
                            }
                            else {
                                imagePath = "";
                            }
                            console.log(imagePath);
                            itemController.addItem(partNo, user, locker, description, imagePath, function (result) {
                                if (result.code == 0) {
                                    console.log("Item added successfully.");
                                    message = "Item added successfully.";
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                                    res.write("Item added successfully.");
                                    res.end();
                                } else if (result.code == 1) {
                                    console.log("Error in adding item.");
                                    message = "Error in adding item.";
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                                    res.write("Error in adding item.");
                                    res.end();
                                }
                            });
                        });
                       }else{
                        console.log("Locker ref unavailable.");
                        message = "Locker ref unavailable.";
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                        res.write("Locker ref unavailable.");
                        res.end();
                    }
                }else{
                    console.log("Wrong user");
                    message = "Wrong user";
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                    res.write("Wrong user.");
                    res.end();
                }
            }else{
                console.log("No user reference sent");
                message = "No user reference sent";
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                res.write("No user reference sent.");
                res.end();
            }
        }else{
            console.log("No partNo sent");
            message = "No partNo.";
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            res.write("No partNo. sent");
            res.end();
        }
    }else{
        console.log("No event called addItem");
        message = "No password.";
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        res.write("No event called addItem.");
        res.end();
    }
});

/*
Everything from here is default for setting the app.
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Normalize a port into a number, string, or false.
 */


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;

