var jwt = require('jsonwebtoken');

exports.isAuthenticated = function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.session.token;

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, 'ilovescotchyscotch', function(err, decoded) {
      if (err) {
        return res.redirect('/');
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.redirect('/login');
  }
}

exports.logOut = function(req,res,next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.session.token;
  if (token){
    
  }
}