var fs = require('fs');
var googleAuth = require('google-auth-library');
var path = require('path');
var readline = require('readline');
var authenticator = (function() {


    var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
    var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
        process.env.USERPROFILE) + '/.credentials/';

    var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

    function getCredentials(callback) {
        fs.readFile(path.join(__dirname, '../') + 'client_secret.json', function(err, response) {
            if (err)
                throw err;
            callback(JSON.parse(response));
        })
    }

    function authorize(credentials) {

        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        return new Promise(function(resolve, reject) {
            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, function(err, token) {
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
                    storeToken(token).then(function(response) {
                        resolve(oauth2Client);
                    });
                }
            });
            // });
        })

    }

    function storeToken(token) {
        return new Promise(function(resolve, reject) {
            try {
                fs.mkdirSync(TOKEN_DIR);
            } catch (err) {
                if (err.code != 'EEXIST') {
                    reject(err)
                }
            }
            fs.writeFile(TOKEN_PATH, JSON.stringify(token));
            resolve('Token stored to disk');
        })
    }

    function authenticate(callback) {
        getCredentials(function(credentials) {
            var jsonResponse = {};
            authorize(credentials)
                .then(function(auth) {
                    jsonResponse.success = true;
                    callback(jsonResponse, auth);
                })
                .catch(function(authUrl) {
                    jsonResponse.success = false;
                    jsonResponse.redirectUrl = authUrl;
                    callback(jsonResponse);
                })
        })

    }

    function refreshToken(code, callback) {
        getCredentials(function(credentials) {
            var jsonResponse = {};
            getNewToken(credentials, code)
                .then(function(auth) {
                    jsonResponse.success = true
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
        refreshToken
    }
})()
module.exports = authenticator;