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

app.post('/app/login', function(req, res) {
    var token = req.body.token;
    console.log(token + ' token')
    if (!token) {
        authenticator.authenticate()
            .then(function([data, auth]) {
                res.send(data);
            })
            .catch(function(err) {
                console.log('here')
                res.send(err)
            })
    } else {
        authenticator.refreshToken(token, function(data, oauth2Client) {
            res.json(data);
        })
    }
});

app.post('/app/logout', function(request, response) {
    var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
        process.env.USERPROFILE) + '/.credentials/';

    var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

    var res = {};
    console.log('j')
    model.deleteData(function(err, data) {
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
    console.log('no of days requested:' + noOfDays)
    var res = {};
    authenticator.authenticate()
        .then(function([jsonResponse, oauth2Client]) {
            console.log('stage 1 ')
            return requester.retrieveMailThreadsUsingGoogleAPIs('me', noOfDays, oauth2Client)
        })
        .then(function(data) {
            console.log('stage 2')
            res.count = data.data.length;
            console.log('data length:' + data.data.length)
            return model.storeThreads(data.data);
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

app.get('/app/data/:query', function(request, response) {
    var query = request.params.query;

    if (query == "{{all}}")
        query = null;
    console.log('query:' + yquery)
    model.fetchData(query, function(err, data) {
        if (err) {
            response.json(err)
        } else
            response.json(data)
    })
})

app.get('/app/refresh', function(request, response) {
    model.getLastRefresh(function(err, data) {
        if (err)
            response.send(err);
        else {
            if (data.length == 0)
                response.send('never');
            else
                response.send(data[data.length - 1].lastRefresh)
        }
    })
})

/* starting server at port 8080*/
var server = app.listen(8080, function() {
    console.log("server started and listening :=" + server.address().address + ":" + server.address().port);
})