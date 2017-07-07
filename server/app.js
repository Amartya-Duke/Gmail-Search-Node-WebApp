var express = require('express');
var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');
var path = require('path');
var bodyParser = require("body-parser");
var rp = require('request-promise');
var mongoose = require('mongoose');

var authenticator = require('./api/handlers/authenticator.js');
var requester = require('./api/handlers/requester.js');
var model = require('./api/model/model.js');


var app = express();

app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, '../client/')));

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

app.get('/authorize', function(req, res) {
    var code = req.query.code;
    authenticator.refreshToken(code, function(data, oauth2Client) {
        res.cookie("email", data.email);
        res.redirect('/home.html');
    })
})

app.post('/app/login', function(req, res) {

    var email = req.body.email;
    console.log(email);
    authenticator.authenticate(email)
        .then(function([data, auth]) {
            res.send(data);
        })
        .catch(function(err) {
            console.log(err)
            res.send(err)
        })
});

app.post('/app/logout', function(request, response) {
    var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
        process.env.USERPROFILE) + '/.gmail_store_credentials/';
    console.log(request.body)
    var email = request.body.email;
    var TOKEN_PATH = TOKEN_DIR + authenticator.getTokenPath(email);

    var res = {};
    console.log(TOKEN_PATH)
    model.deleteData(email, function(err, data) {
        console.log('k')

        if (err) {
            res.success = false;
            res.err = err;
            response.json(res);
        } else {
            fs.unlink(TOKEN_PATH, function(err) {
                if (err) {
                    res.success = false;
                    res.err += err;
                } else {
                    res.success = true;
                    console.log('file deleted successfully');
                }
                response.json(res);
            })
        }
    })
})

app.post('/app/threads/:days', function(request, response) {
    var noOfDays = request.params.days;
    var email = request.body.email;
    console.log(email)
    console.log('no of days requested:' + noOfDays)
    var res = {};
    authenticator.authenticate(email)
        .then(function([jsonResponse, oauth2Client]) {
            console.log('stage 1 ');
            return requester.retrieveMailThreadsUsingGoogleAPIs(email, noOfDays, oauth2Client)
        })
        .then(function(data) {
            console.log('stage 2');
            console.log('Total Message count : ' + data.messageCount);
            res.messageDownloadedCount = data.messageCount;
            res.threadDownloadedCount = data.data.length;
            res.totalMessageCount = data.totalMessageCount;
            res.totalThreadCount = data.totalThreadCount;
            console.log('Total Thread count:' + data.data.length);
            return model.storeThreads(email, data.data, data.messageCount, data.data.length, data.totalMessageCount, data.totalThreadCount);
        })
        .then(function(data) {
            console.log('stage 3')
            res.success = true;
            res.lastRefresh = data;
            response.json(res);
        })
        .catch(function(err) {
            response.json(err)
        });


});

app.get('/app/data/:query/:email', function(request, response) {
    var query = request.params.query;
    var email = request.params.email;
    console.log('query:' + query + " email: " + email)
    if (query == "{{all}}")
        query = null;
    authenticator.authenticate(email)
        .then(function([jsonResponse, oauth2Client]) {
            model.fetchData(email, query, function(err, data) {
                if (err) {
                    response.json(err)
                } else
                    response.json(data)
            })
        })
        .catch(function(err) {
            response.json(err)
        })
})

app.get('/app/refresh/:email', function(request, response) {
    var email = request.params.email;
    console.log(email)
    model.getLastRefresh(email, function(err, data) {
        if (err)
            response.send(err);
        else {
            response.send(data[0])
        }
    })
})

/* starting server at port 8080*/
var server = app.listen(8080, function() {
    console.log("server started and listening :=" + server.address().address + ":" + server.address().port);
})