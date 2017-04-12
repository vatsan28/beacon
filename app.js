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
var deviceId_RFID = "560053000b51353335323535";
var deviceId_Hinge_Door2 = "240024001747353236343033";
var deviceId_DoorController = "190038000e47343432313031";
// var door1Status = "Close";
// var door2Status = "Close";
var deviceId_Foam_Door1 = "26002b000447343339373536";
var access_token = "74e7ffc69fb545d831515a6ac8d9eca7cc0e3832";

//Event stream to listen to the RFID login process.
var login = particle.getEventStream({deviceId: deviceId_RFID,name:'Login',auth: access_token}); //Name is the name of the event being published at the particle dashboard.
login.then(
    function(stream){
        stream.on('event',function(data){
            console.log("Event:" + data.data);
            if (data.data.toLowerCase() == "yes"){ // If the particle photon accepts the RFID, then login is simulated in the app.
                io.sockets.emit("Login",{userId: user}); //Emit socket message to the front end of the app in the welcome page.
            }
        });
    });

//Event stream to listen to the hinge updates from the vending machine. (Door2).
var hingeUpdate = particle.getEventStream({deviceId: deviceId_Hinge_Door2,name:'hingeUpdate',auth:access_token}); //Name is the name of the event being published at the particle dashboard.
hingeUpdate.then(
    function(stream) {
       stream.on('event',function (data) {
         console.log("Hinge items Update: "+data.data);
           var locker2Status = data.data;
           // If door is closed then check for the status of each item.
           if ((locker2Status).substr(0,1) == '1'){ //Door is closed.
               console.log("Door is closed.");
               console.log(locker2Status.substr(1));
               // door2Status = "Close";
               var itemStatus = locker2Status.substr(1);
               var i=0;
               var itemsAvailable = [];
               var itemsUnavailable = [];
               //Checking for each item's status.
               while (i<itemStatus.length){
                   var temp;
                   //Assigning locker id to the items as per their position in the hinge.
                   if (i+1 < 10){
                       temp = "L020"+[i+1];
                   }else{
                       temp = "L02"+[i+1];
                   }

                   //If the are available then push them into a available array collection.
                   if (itemStatus[i] == '0'){
                        itemsAvailable.push(temp);
                   }
                   //If the are unavailable then push them into a unavailable array collection.
                   else if (itemStatus[i] == '1'){
                        itemsUnavailable.push(temp);
                   }
                   i++;
               }
               console.log(itemsAvailable);
               console.log(itemsUnavailable);

               //If any, update all the unavailable items' statuses in the backend.
               if (itemsUnavailable.length != 0) {
                   var j=0;
                   while (j<itemsUnavailable.length){
                       itemController.updateItemDispensed(itemsUnavailable[j], function (result) {
                           console.log(result);
                           if (result.code == 0) {
                               console.log("Item dispatched successfully."+result.lockerId);
                           } else {
                               console.log("Item not dispatched."+result.lockerId);
                           }
                       });
                       j++;
                   }
               }
               //If any, update all the available items' statuses in the backend.
                if (itemsAvailable.length != 0) {
                   var j=0;
                   while (j<itemsAvailable.length){
                       itemController.updateItemReturned(itemsAvailable[j], function (result) {
                           console.log(result);
                           if (result.code == 0) {
                               console.log("Item dispatched successfully."+result.lockerId);
                           } else {
                               console.log("Item not dispatched."+result.lockerId);
                           }
                        });
                       j++;
                   }
               }
               //Once the backend process is over, relay the message that the door is closed to the front end.
               io.sockets.emit("DoorClosed");
           }
           //If the door is open, just set the status of the door and wait for it to close.
           else if ((locker2Status).substr(0,1) == '0') { //Door is open.
                console.log("Door 2 is open. Waiting to be closed");
               // door2Status = "Open";
               io.sockets.emit("DoorOpened");
            }
       });
    });
//Event stream to listen to the foam updates from the vending machine. (Door1).
var foamUpdate = particle.getEventStream({deviceId:deviceId_Foam_Door1,name: 'foamUpdate',auth:access_token});
foamUpdate.then(
    function(stream) {
        stream.on('event',function (data) {
            console.log("Foam items Update: "+data.data);
            var locker1Status = data.data;
            // If door is closed then check for the status of each item.
            if ((locker1Status).substr(0,1) == '1'){ //Door is closed.
                console.log("Door is closed.");
                console.log(locker1Status.substr(1));
                // door1Status = "Close";
                var itemStatus = locker1Status.substr(1);
                var i=0;
                var itemsAvailable = [];
                var itemsUnavailable = [];
                //Checking for each item's status.
                while (i<itemStatus.length){
                    var temp;
                    //Assigning locker id to the items as per their position in the hinge.
                    if (i+1 < 10){
                        temp = "L010"+[i+1];
                    }else{
                        temp = "L01"+[i+1];
                    }
                    //If they are available then push them into a available array collection.
                    if (itemStatus[i] == '0'){
                        itemsAvailable.push(temp);
                    }
                    //If they are unavailable then push them into a available array collection.
                    else if (itemStatus[i] == '1'){
                        itemsUnavailable.push(temp);
                    }
                    console.log(itemsAvailable);
                    console.log(itemsUnavailable);
                    i++;
                }
                console.log(itemsAvailable);
                console.log(itemsUnavailable);
                //If any, update all the unavailable items' statuses in the backend.
                if (itemsUnavailable.length != 0) {
                    var j=0;
                    while (j<itemsUnavailable.length){
                        itemController.updateItemDispensed(itemsUnavailable[j], function (result) {
                            console.log(result);
                            if (result.code == 0) {
                                console.log("Item dispatched successfully."+result.lockerId);
                            } else {
                                console.log("Item not dispatched."+result.lockerId);
                            }
                        });
                        j++;
                    }

                }
                //If any, update all the available items' statuses in the backend.
                if (itemsAvailable.length != 0) {
                    var j=0;
                    while (j<itemsAvailable.length){
                        itemController.updateItemReturned(itemsAvailable[j], function (result) {
                            console.log(result);
                            if (result.code == 0) {
                                console.log("Item dispatched successfully."+result.lockerId);
                            } else {
                                console.log("Item not dispatched."+result.lockerId);
                            }
                        });
                        j++;
                    }
                }
                //Once the backend process is over, relay the message that the door is closed to the front end.
                io.sockets.emit("DoorClosed");
            }
            //If the door is open, just set the status of the door and wait for it to close.
            else if ((locker1Status).substr(0,1) == '0') { //Door is open.
                console.log("Door 1 is open. Waiting to be closed");
                // door1Status = "Open";
                io.sockets.emit("DoorOpened");
            }
        });
    });

io.on('connection',function(socket){

    //On a dispensing item socket message, open the appropriate door.
    socket.on("DispensingItem",function(data){
        console.log(data);
        //Fetch the locker id depending on the item.
        itemController.getLockerId(data.partNo,function(result){
            if (result.code == 0){
                if (result.lockerId.length != 0){
                    var locker = result.lockerId;
                    var lockerId = locker.substr(1,2);
                    var deviceLocation = locker.substr(3,2);
                    var doorType;
                    console.log(deviceLocation);
                    console.log(lockerId);
                    if (lockerId == "01"){
                        doorType = 'foam';
                        io.to(socket.id).emit('DeviceLocation',{deviceLocation: deviceLocation,doorType:doorType});
                    }else if (lockerId == "02"){
                        doorType = 'hinges';
                        io.to(socket.id).emit('DeviceLocation',{deviceLocation: deviceLocation,doorType:doorType});
                    }

                    var message = "on"+(lockerId-1);
                    console.log(message);
                    //Invoking the particle photon function to open the door.
                    if (lockerId != "03"){
                        var fnPr = particle.publishEvent({ name: 'doorSignal', data: message, auth: access_token });
                        // var fnPr = particle.callFunction({ deviceId: deviceId_DoorController, name: 'led', argument: message, auth: access_token });
                    }else {
                        var fnPrLocker3  = particle.publishEvent({ name: 'doorSignal', data: message, auth: access_token });
                        // var fnPrLocker3 = particle.callFunction({ deviceId: deviceId_DoorController, name: 'led', argument: message, auth: access_token });
                    }
                    if (lockerId != "03"){
                        /*  -> If the door opening function is invoked properly, wait to listen to the door is open status from the door sensor and then change the message in the front end.
                         -> If the door isn't opening once, then try 3 times before aborting the process.
                         -> If the door opens, then for the 1st door(foam tools door),light up the LED for the correct item.
                         -> lightUpLed() is the function to light up the correct item.
                         */
                        fnPr.then(
                            function(response) {
                                console.log('Function called successfully:', response);
                                if (lockerId == "01"){
                                    console.log("Trying to open foam door---------------------------------------");
                                }
                                else if (lockerId == "02"){
                                    console.log("Trying to open hinges door---------------------------------------");
                                }
                            }, function(err) {
                                console.log('An error occurred:', err);
                                console.log("Could not open door");
                                io.sockets.emit("DoorClosed");
                            });
                        // var tempI = 0;
                        // // console.log("Purpose:"+data.purpose);
                        // // lightUpLed(doorType,deviceLocation,data.purpose);
                        // // while (tempI!=10){
                        // //     setTimeout(function(){lightUpLed(doorType,deviceLocation,data.purpose);},500);
                        // //     tempI++;
                        // // }

                    }else if (lockerId == "03"){
                        /*
                            If it is the gloves door, then just assume the user replaces or puts back the item successfully and closes the door in 3 seconds.
                         */
                        fnPrLocker3.then(function(response){
                            console.log("Door opened",response);
                            console.log("All done");
                            if (data.purpose.toLowerCase() == "return"){
                                itemController.workOrderItemReturn(data.partNo,function(res){
                                    if (res.code == 0){
                                        console.log("Success in updating work order item.");
                                    }else{
                                        console.log("Error in updating work order item update.");
                                    }
                                });
                            }else if (data.purpose.toLowerCase() == "dispense") {
                                itemController.workOrderItemUpdate(data.partNo,function(res){
                                    if (res.code == 0){
                                        console.log("Success in updating work order item.");
                                    }else{
                                        console.log("Error in updating work order item update.");
                                    }
                                });
                            }

                            setTimeout(function(){
                                console.log("Door closing now!!!");
                                io.sockets.emit("WorkOrderDoorCloseInReturn");
                            },3500);
                        },function(err){
                            console.log('An error occurred:', err);
                            console.log("Could not open work order door");
                            io.sockets.emit("WorkOrderDoorCloseInReturn");
                        });
                    } else {
                        console.log("Particle functions not working");
                    }
                }
                else{
                    console.log("Error with parsing locker for the item.");
                }
            }else{
                console.log("Error with fetching locker for the item.");
            }
        });
    });

    //Socket message to enable opening the door when user clicks on the work card.
    socket.on("DispenseWorkOrderTool",function(data){
       console.log(data.partNo);
        itemController.getLockerId(data.partNo,function(result) {
            if (result.code == 0){
                if (result.lockerId.length!=0){
                    var locker = result.lockerId;
                    var lockerId = locker.substr(1,2);
                    var message = "on"+(lockerId-1);
                    console.log(message);
                    //Particle function to open the 3rd door(Gloves door).
                    // var fnPr1 = particle.callFunction({ deviceId: deviceId_DoorController, name: 'led', argument: message, auth: access_token });
                    var fnPr1 = particle.publishEvent({ name: 'doorSignal', data: message, auth: access_token });
                    fnPr1.then(function(response){
                        console.log("Door opened",response);
                        console.log("ALl done");
                        itemController.workOrderItemUpdate(data.partNo,function(res){
                            if (res.code == 0){
                                console.log("Success in updating work order item.");
                            }else{
                                console.log("Error in updating work order item update.");
                            }
                        });
                        // An assumption that the user picks up the gloves in 3.5 seconds and closes the door.
                        setTimeout(function(){
                            console.log("Door closing now!!!");
                            io.sockets.emit("WorkOrderDoorClose");
                        },3500);
                    },function(err){
                        console.log('An error occurred:', err);
                        console.log("Could not open work order door");
                        io.sockets.emit("WorkOrderDoorClose");
                    });
                }else{
                    console.log("Error with parsing locker for the work order.");
                }
            }else{
                console.log("Error opening work order tool locker.");
            }
        });
    });

    socket.on("MissingTool",function(data){
        console.log("Missing tool: "+data.partNo);
        itemController.updateMissingTool(data.partNo,function(result){
            if (result.code == 0){
                console.log("Success in updating missing item.");
                io.sockets.emit("MissingItemUpdated",{partNo: data.partNo});
            }else{
                console.log("Error in updating missing item.");
            }
        });
    });

    socket.on('MissingToolReplaced',function(data){
        console.log("Missing tool replaced: "+data.partNo);
        itemController.updateMissingToolReplaced(data.partNo,function(result){
            if (result.code == 0){
                console.log("Success in updating missing item replaced.");
                io.sockets.emit("MissingItemReplaceUpdated");
            }else{
                console.log("Error in updating missing item replaced.");
            }
        });
    });

    socket.on('LightUpLed',function(data){
        console.log(data.itemLoc+"---"+data.purpose+'---'+data.doorType);
        if (data.itemLoc != null && data.purpose != null && data.doorType != null ){
            lightUpLed(data.doorType,data.itemLoc,data.purpose);
        }else{
            console.log("Null error handled for LED function.");
        }

    });
});

//Function to light up the LED in the foam cut out.
function lightUpLed(doorType,deviceLocation,purpose){
    console.log("All fine and opened for "+doorType);
    var tempMsg;
    if (purpose == "return"){
        tempMsg = "return"+deviceLocation.substr(1,1);
    }else if (purpose == "dispense"){
        tempMsg = "tool"+deviceLocation.substr(1,1);
    }
    // console.log(tempMsg);
    var device;
    if (doorType.toLowerCase() == "hinges"){
        tempMsg = "02"+tempMsg;
        // device = deviceId_Hinge_Door2;
    }else if (doorType.toLowerCase() == "foam"){
        tempMsg = "01"+tempMsg;
    }
    console.log(tempMsg);
    var lightUp = particle.publishEvent({ name: 'led', data: tempMsg, auth: access_token });
    // var lightUp = particle.callFunction({deviceId: device,name: 'led',argument: tempMsg ,auth:access_token});
    lightUp.then(function(result){
        console.log('Led Function called successfully:', result);
    },function (err) {
        console.log('An error occurred:', err);
        console.log("Could not light up the device location.");
    });
}



/* -> API requests to add item to the database.
   -> Essential parameters:
        1. event: This should be 'additem'.
        2. user: This should be the user variable declared. (jim for now).
        3. locker: This should be a valid locker id for the system to work properly. (Eg: L0103 - meaning 3rd locker and 1st position in that locker).
        4. partNo: part number of the item being added.
        5. description: A description of the item being added which will be displayed on the front end.
 */
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

