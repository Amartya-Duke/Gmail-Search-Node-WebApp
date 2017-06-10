var fs = require('fs');
var googleAuth = require('google-auth-library');
var path = require('path');
var readline = require('readline');
var authenticator = (function() {


    var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
    var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
        process.env.USERPROFILE) + '/.credentials/';

    var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';


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
                    resolve('Authentication success')
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
            // var rl = readline.createInterface({
            //     input: process.stdin,
            //     output: process.stdout
            // });
            // rl.question('Enter the code from that page here: ', function(code) {
            //     rl.close();
            oauth2Client.getToken(code, function(err, token) {
                if (err) {
                    reject('Error while trying to retrieve access token:' + err);
                } else {
                    oauth2Client.credentials = token;
                    storeToken(token).then(function(response) {
                        resolve(response);
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
            resolve('Token stored to ' + TOKEN_PATH);
        })
    }

    function authenticate(credentials) {
        return new Promise(function(resolve, reject) {
            authorize(credentials)
                .then(function(result) {
                    resolve('Success');
                })
                .catch(function(authUrl) {
                    reject(authUrl);
                })
        })
    }

    function refreshToken(credentials, code) {
        return new Promise(function(resolve, reject) {
            getNewToken(credentials, code)
                .then(function(result) {
                    resolve('Success');
                })
                .catch(function(err) {
                    reject(err);
                })
        })
    }
    return {
        authenticate,
        refreshToken
    }
})()
module.exports = authenticator;