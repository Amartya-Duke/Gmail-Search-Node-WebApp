var express = require('express');
var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');
var path = require('path');
var bodyParser = require("body-parser");
var authenticator = require('./authenticator.js');

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
    fs.readFile(path.join(__dirname, '../') + 'client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            throw err;
        }
        content = JSON.parse(content);
        if (!data) {
            var jsonResponse = {};
            authenticator.authenticate(content).then(function(response) {
                    console.log(response)
                    jsonResponse.success = true;
                    res.json(jsonResponse);
                })
                .catch(function(authUrl) {
                    jsonResponse.success = false;
                    jsonResponse.redirectUrl = authUrl;
                    res.json(jsonResponse);
                });
        } else {
            authenticator.refreshToken(content, data)
                .then(function(response) {
                    jsonResponse.success = true;
                    console.log(response)
                    res.json(jsonResponse);
                })
                .catch(function(err) {
                    jsonResponse.success = false;
                    jsonResponse.error = err;
                    console.log(err)
                    res.json(jsonResponse);
                })
        }
    });

});

/* starting server at port 8080*/
var server = app.listen(8080, function() {
    console.log("server started and listening :=" + server.address().port);
})