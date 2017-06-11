var express = require('express');
var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');
var path = require('path');
var bodyParser = require("body-parser");
var authenticator = require('./authenticator.js');
var requester = require('./requester.js');
var model = require('./model.js');
var rp = require('request-promise');
var mongoose = require('mongoose');
var app = express();

app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, '../')));

mongoose.connect('127.0.0.1:27017/gmailStore');
var db = mongoose.connection;

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

app.post('/getThreads/:days', function(request, response) {
    var data = request.body.code;
    var noOfDays = request.params.days;
    console.log(noOfDays)
    if (!data) {
        authenticator.authenticate(function(res, oauth2Client) {
            console.log(res)
            if (res.success) {
                requester.retrieveMailThreadsUsingGoogleAPIs('me', noOfDays, oauth2Client, function(data) {
                    model.storeThreads(data.threads, function(err, data) {
                        if (err)
                            console.log(err);
                        else {
                            console.log('Stored in database')
                            res.data = data;
                            response.json(res);
                        }
                    });

                })
            } else {
                response.json(res)
            }
        })
    } else {
        authenticator.refreshToken(data, function(res, oauth2Client) {
            response.json(res);
        })
    }
});

app.get('/getThreadsFromId/:threadId', function(request, response) {
    var threadId = request.params.threadId;
    authenticator.authenticate(function(res, oauth2Client) {
        if (res.success) {
            requester.getThread('me', threadId, oauth2Client, function(res) {
                response.json(res)
            })

        } else {
            authenticator.refreshToken(data, function(res, oauth2Client) {
                response.json(res);
            })
        }
    })

})


/* starting server at port 8080*/
var server = app.listen(8080, function() {
    console.log("server started and listening :=" + server.address().port);
})