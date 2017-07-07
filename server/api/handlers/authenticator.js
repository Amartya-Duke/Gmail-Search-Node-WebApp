var fs = require('fs');
var rp = require('request-promise');
var googleAuth = require('google-auth-library');
var path = require('path');
var readline = require('readline');

var requester = require('./requester.js');

var authenticator = (function() {


    var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
    var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
        process.env.USERPROFILE) + '/.gmail_store_credentials/';

    function getTokenPath(email) {
        var TOKEN_PATH = email.replace(/\./g, '_') + '.json';
        console.log(TOKEN_DIR.concat(TOKEN_PATH));
        return TOKEN_PATH;
    }

    function getCredentials(callback) {
        fs.readFile(path.join(__dirname, '../secret/') + 'client_secret.json', function(err, response) {
            if (err)
                throw err;
            callback(JSON.parse(response));
        })
    }

    function authorize(email, credentials) {

        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        return new Promise(function(resolve, reject) {
            // Check if we have previously stored a token.
            console.log(TOKEN_DIR + getTokenPath(email))
            fs.readFile(TOKEN_DIR + getTokenPath(email), function(err, token) {
                if (err) {
                    var authUrl = oauth2Client.generateAuthUrl({
                        access_type: 'offline',
                        scope: SCOPES
                    });

                    console.log('Authorize this app by visiting this url: ', authUrl);
                    reject(authUrl);
                } else {
                    oauth2Client.credentials = JSON.parse(token);
                    resolve(oauth2Client)
                }
            });
        })

    }

    function getNewToken(credentials, code) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        return new Promise(function(resolve, reject) {
            console.log('code entered:' + code);
            oauth2Client.getToken(code, function(err, token) {
                if (err) {
                    reject('Error while trying to retrieve access token:' + err);
                } else {
                    oauth2Client.credentials = token;
                    requester.getProfileInfo(oauth2Client, function(data) {
                        console.log(data)
                        oauth2Client.email = data.emailAddress;
                        storeToken(token, data.emailAddress).then(function(response) {
                                resolve([oauth2Client, data.emailAddress]);
                            })
                            .catch(function(err) {
                                console.log(err)
                                reject(err)
                            });
                    })
                }
            });
        })

    }



    function storeToken(token, email) {
        console.log("email:" + email);
        return new Promise(function(resolve, reject) {
            try {
                fs.mkdirSync(TOKEN_DIR);
            } catch (err) {
                if (err.code != 'EEXIST') {
                    console.log(err)
                    reject(err)
                }
            }
            fs.writeFile(TOKEN_DIR.concat(getTokenPath(email)), JSON.stringify(token), function(err) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else
                    resolve('Token stored to disk');
            });

        })
    }

    function authenticate(email) {
        return new Promise(function(resolve, reject) {
            getCredentials(function(credentials) {
                var jsonResponse = {};
                authorize(email, credentials)
                    .then(function(auth) {
                        jsonResponse.success = true;
                        resolve([jsonResponse, auth]);
                    })
                    .catch(function(authUrl) {
                        jsonResponse.success = false;
                        jsonResponse.redirectUrl = authUrl;
                        reject(jsonResponse);
                    })
            })
        })
    }

    function refreshToken(code, callback) {
        getCredentials(function(credentials) {
            var jsonResponse = {};
            getNewToken(credentials, code)
                .then(function([auth, email]) {
                    jsonResponse.success = true
                    jsonResponse.email = email;
                    callback(jsonResponse, auth.credentials.access_token);
                })
                .catch(function(err) {
                    jsonResponse.success = false;
                    jsonResponse.error = err;
                    callback(jsonResponse, null);
                })
        })
    }
    return {
        authenticate,
        refreshToken,
        getTokenPath
    }
})()
module.exports = authenticator;