const approuter = require('@sap/approuter');
const jwtDecode = require('jwt-decode');
 
var ar = approuter();
ar.beforeRequestHandler.use('/getuserinfo', function (req, res, next) {
   if (!req.user) {
     res.statusCode = 403;
     res.end("Fehler beim Laden von Benutzerinformationen!");
   } else {
          var decodedJWTToken = jwtDecode(req.user.token.accessToken);
     res.statusCode = 200;
     res.end(JSON.stringify({user: {id: req.user.id, name: req.user.name, details: decodedJWTToken}}));
   } 
});
ar.start();
