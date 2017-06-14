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
    var token = req.body.token;
    console.log(token + ' token')
    if (!token) {
        authenticator.authenticate(function(data, oauth2Client) {
            res.send(data);
        })
    } else {
        authenticator.refreshToken(token, function(data, oauth2Client) {
            res.json(data);
        })
    }
});

app.post('/logout', function(request, response) {
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

app.post('/getThreads/:days', function(request, response) {
    var noOfDays = request.params.days;
    console.log(noOfDays)

    authenticator.authenticate(function(res, oauth2Client) {
        console.log(res)
        if (res.success) {
            requester.retrieveMailThreadsUsingGoogleAPIs('me', noOfDays, oauth2Client, function(data) {

                model.storeThreads(data, function(err, data) {
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

});

app.post('/fetchData/:query', function(request, response) {
    var query = request.params.query;
    console.log('abc')
    model.fetchData(query, function(err, data) {
        if (err) {
            console.log('here')
            response.json(err)
        } else
            response.json(data)
    })
})

app.get('/getMessagesFromThreadId/:threadId', function(request, response) {
    var threadId = request.params.threadId;
    authenticator.authenticate(function(res, oauth2Client) {
        if (res.success) {
            requester.getMessagesFromThreadId('me', threadId, oauth2Client)
                .then(function(data) {
                    console.log(data)
                    model.storeThreads(data, function(err, data) {
                        if (err)
                            console.log(err);
                        else {
                            console.log('Stored in database')
                            res.data = data;
                            response.json(data);
                        }
                    });
                })
                .catch(function(err) {
                    console.log(err)
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
    console.log("server started and listening :=" + server.address().address + ":" + server.address().port);
})