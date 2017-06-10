var express = require('express');
var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');
var path = require('path');
var bodyParser = require("body-parser");
var authenticator = require('./authenticator.js');
var requester = require('./requester.js');
var rp = require('request-promise');
var app = express();

app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, '../')));

/* Allowing cross domain access */
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}
app.use(allowCrossDomain);

app.post('/login', function(req, res) {
    var data = req.body.code;
    if (!data) {
        authenticator.authenticate(function(response, oauth2Client) {
            res.json(response);
        })
    } else {
        authenticator.refreshToken(data, function(response, oauth2Client) {
            res.json(response);
        })
    }
});

app.post('/getThreads', function(request, response) {
    var data = request.body.code;
    if (!data) {
        authenticator.authenticate(function(res, oauth2Client) {
            console.log(res)
            if (res.success)
                requester.retrieveMailThreadsUsingGoogleAPIs('me', 10, oauth2Client);

            response.json(res)
        })
    } else {
        authenticator.refreshToken(data, function(res, oauth2Client) {
            response.json(response);
        })
    }
});




/* starting server at port 8080*/
var server = app.listen(8080, function() {
    console.log("server started and listening :=" + server.address().port);
})