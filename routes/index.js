var express = require('express');
var router = express.Router();
var authRouter = express.Router();
// var userController = require('../controllers/users');
var itemController = require('../controllers/items');
var middleware = require('./middleware');
var Client = require('node-rest-client').Client;
var user = 'jim';

//Route : redirect to home page.
router.get('/',function(req,res,next) {
  itemController.getTotalItems(function (result) {
    if (result.code == 0) {
      var totalItem = result.count;
      itemController.getTotalCheckedOutItems(function (response) {
        if (response.code == 0) {
          var totalCheckedOut = response.count;
          res.render("welcomepage", {total: totalItem, totalCheckedOut: totalCheckedOut});
        } else {
          console.log("Error in finding checked out items.");
        }
      });
    } else {
      console.log("Error in finding total");
    }
  });
});

/*  Request for home page, redirect to home page with the following data:
      1. Total count of all checked out tools.
      2. Total count of all work order tools
      3. Work order item details.
      4. User.
 */
router.get(['/home','/home/start'],function(req,res,next){
  itemController.getTotalCheckedOutByUser(user,function(result){
    if (result.code == 0){
      var checkedOutCount = result.count;
      // console.log(checkedOutCount);
      itemController.getWorkOrderTool(user,function(result){
        if (result.code == 0) {
          // console.log(result.docs.length);
          var workOrderToolsCount = result.docs.length;
          var workOrderItem = result.docs[0];
          res.render('home',{message:'',checkedOutCount : checkedOutCount,user: user.toUpperCase(),workOrderToolsCount: workOrderToolsCount,workOrderItem : workOrderItem});
        }else{
          console.log("Error in finding tools for work order for the user.");
        }
      });
    }else{
      console.log("Error in finding tools checked by the user.");
    }
  });
});

/*  Request for all tools page, redirect to the all tools page with the following data:
 1. All available items.
 2. All tools checked out by the user.
 3. All tools checked out by other users.
 3. Work order item details(separate variables depending on availability).
 4. User.
 5. View - allView.
 */
router.get('/alltools', function(req, res, next) {
  var data = {};
  var availableItems;
  var checkedOutByUser;
  var checkedOutByOthers;
  var workOrderTool;
  var missingItems;
  itemController.getAllAvailableItemsByUser(user,function(result){
    if (result.code == 0){
      availableItems = result.docs;
      itemController.getAllCheckedOutToolsByUser(user,function(response){
        if (response.code == 0){
          checkedOutByUser = response.docs;
          itemController.getAllCheckedOutToolsByOtherUsers(user,function(status){
            if (status.code == 0){
              checkedOutByOthers = status.docs;
              itemController.getMissingTools(user,function(missingStatus){
                if (missingStatus.code == 0) {
                  // console.log("Missing Items: "+missingStatus.docs);
                  missingItems = missingStatus.docs;
                  itemController.getWorkOrderToolForAllItems(user, function (rescode) {
                    if (rescode.code == 0) {
                      workOrderTool = rescode.docs;
                      // console.log(workOrderTool.length);
                      if (rescode.docs[0].status.toLowerCase() == "unavailable") {
                        res.render('alltools', {
                          availableItems: availableItems,
                          checkedOutByUser: checkedOutByUser,
                          checkedOutByOthers: checkedOutByOthers,
                          view: "allView",
                          user: user.toUpperCase(),
                          workOrderToolUnavailable: workOrderTool,
                          missingTools: missingItems
                        });
                      } else if (rescode.docs[0].status.toLowerCase() == "available") {
                        res.render('alltools', {
                          availableItems: availableItems,
                          checkedOutByUser: checkedOutByUser,
                          checkedOutByOthers: checkedOutByOthers,
                          view: "allView",
                          user: user.toUpperCase(),
                          workOrderToolAvailable: workOrderTool,
                          missingTools: missingItems
                        });
                      } else {
                        console.log("Error in fetching work order item's status for the user.");
                      }
                    } else {
                      console.log("Error in fetching work order items for the user.");
                    }
                  });
                }else{
                  console.log("Error in fetching missing items for the user.");
                }
            })
            }else{
              console.log("Error in fetching checked out items for the user.");
            }
          });
        }else{
          console.log("Error in fetching checked out items for the user.");
        }
      });
    }else{
      console.log("Error in fetching available items for the user.");
    }
  });
  //
});


/*  Request for all tools page but only with tools that should be returned, redirect to the all tools page with the following data:
 1. All available items.
 2. All tools checked out by the user.
 3. All tools checked out by other users.
 3. Work order item details(separate variables depending on availability).
 4. User.
 5. View - returnView or allView if there are 0 items to be returned.
 */
router.get('/alltools/:view', function(req, res, next) {
  // console.log(req.params.view);
  var view = req.params.view;
  var data = {};
  var availableItems=[];
  var checkedOutByUser=[];
  var checkedOutByOthers=[];
  var workOrderTool;
  var missingItems;
  itemController.getAllAvailableItemsByUser(user,function(result){
    if (result.code == 0){
      availableItems = result.docs;
      itemController.getAllCheckedOutToolsByUser(user,function(response){
        if (response.code == 0){
          checkedOutByUser = response.docs;
          itemController.getAllCheckedOutToolsByOtherUsers(user,function(status){
            if (status.code == 0){
              checkedOutByOthers = status.docs;
              itemController.getMissingTools(user,function(missingStatus){
                if (missingStatus.code == 0) {
                  // console.log("Missing Items: " + missingStatus.docs);
                  missingItems = missingStatus.docs;
                  itemController.getWorkOrderToolForAllItems(user,function(retcode){
                  if (retcode.code == 0){
                    if (retcode.docs[0].status.toLocaleLowerCase() == "unavailable"){
                      workOrderTool = retcode.docs;
                      // console.log("---------------------"+workOrderTool.length);
                    }
                    // console.log(checkedOutByOthers,checkedOutByUser,availableItems);
                    if (view.toLowerCase() == "returnview"){
                      if ((checkedOutByUser.length != 0) || (retcode.docs[0].status == "Unavailable"))
                      {
                        console.log("Rendering all return tools");
                        res.render('alltools', {checkedOutByUser: checkedOutByUser,view: 'returnView',user: user.toUpperCase(),workOrderToolUnavailable: workOrderTool,missingTools: missingItems});
                      }
                      else{
                        res.redirect('/home');
                      }
                    }else {
                      res.render('alltools', {availableItems: availableItems,checkedOutByUser: checkedOutByUser,checkedOutByOthers: checkedOutByOthers,view: 'allView',user: user.toUpperCase(),missingTools: missingItems});
                    }
                  }else{
                  console.log("Error in fetching checked out items for the user.");
                }
              });
              }else{
                  console.log("Error in fetching missing items for the user.");
              }
            });
            }else{
              console.log("Error in fetching checked out items for the user.");
            }
          });
        }else{
          console.log("Error in fetching checked out items for the user.");
        }

      });
    }else{
      console.log("Error in fetching available items for the user.");
    }
  });
  //
});

module.exports = router;
