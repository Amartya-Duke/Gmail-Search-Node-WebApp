var rp = require('request-promise');
var path = require('path');
var fs = require('fs');
var google = require('googleapis');
var requester = (function() {
    function getOptions(userId, dateRange, type, auth) {
        var a = 'ya29.GltlBEnk00VkarIvOExT797nm7u65cgACyXElhIuM1OqPuiw6LYranEuK3upYbziXC1YHblWtZor8LKJ4PmdDPoSKYzK2uvS5TFU6H1TaugZ2ikJCoAeaCtOAbC5';


        var options = {
            method: 'GET',
            uri: 'https://www.googleapis.com/gmail/v1/users/' + userId + '/' + type,
            headers: {
                authorization: 'Bearer ' + a,
                'content-type': 'application/json'
            },
            params: { 'q': 'newer_than: 1d' },
            json: true // Automatically stringifies the body to JSON 
        };
        return options;
    }

    function getDate(noOfDays) {
        var today = new Date();
        var priorDate = new Date().setDate(today.getDate() - noOfDays);
        var dateRange = {};
        dateRange.from = new Date(priorDate).toLocaleDateString().split('T')[0].replace(/-/g, '/');
        dateRange.to = today.toLocaleDateString().split('T')[0].replace(/-/g, '/');
        return dateRange;
    }

    function sleep(miliseconds) {
        var currentTime = new Date().getTime();

        while (currentTime + miliseconds >= new Date().getTime()) {}
    }

    function storeMessage(token, callback) {
        var json = {};
        json.threads = token;
        var pat = path.join(__dirname, '../../') + 'messages/messages.json';
        fs.truncate(pat, 0, function() {
            for (var i = 0; i < token.length; i++) {
                sleep(0);
                fs.appendFile(pat, '\n' + JSON.stringify(token[i]), function(err) {
                    if (err) throw err;

                });
            }
            console.log('Saved!');
            callback(json)
        })

    }

    function retrieveMailThreads(userId, noOfDays, auth) {
        var dateRange = getDate(noOfDays);
        var options = getOptions(userId, dateRange, 'threads', auth);
        rp(options)
            .then(function(parsedBody) {
                // Process html like you would with jQuery...
                storeMessage(parsedBody);
                console.log('stored in file')
            })
            .catch(function(err) {
                // Crawling failed or Cheerio choked...
                console.log(err.message)
            });
    }

    function retrieveMailThreadsUsingGoogleAPIs(userId, noOfDays, auth, callback) {
        var gmail = google.gmail('v1');
        var query = 'after:' + getDate(noOfDays).from.toString();
        console.log(query)
        var result = [];

        gmail.users.threads.list({
            auth: auth,
            userId: 'me',
            q: query,
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            result = result.concat(response.threads);
            if (response.nextPageToken)
                getNextPageOfThreads(response.nextPageToken, result);
            else {
                storeMessage(result, callback)
            }
        });

        function getNextPageOfThreads(nextPageToken, result) {
            gmail.users.threads.list({
                auth: auth,
                userId: userId,
                q: query,
                pageToken: nextPageToken
            }, function(err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                result = result.concat(response.threads);
                if (response.nextPageToken)
                    getNextPageOfThreads(response.nextPageToken, result);
                else {
                    storeMessage(result, callback)
                }
            });
        }

    }

    function getThread(userId, threadId, auth, callback) {
        var gmail = google.gmail('v1');
        gmail.users.threads.get({
            auth: auth,
            userId: userId,
            id: threadId
        }, function(err, response) {
            var json = {};
            if (err)
                json.success = false;
            else {
                json.success = true;
                json.data = response;
                callback(json);
            }

        })
    }

    return {
        retrieveMailThreads,
        retrieveMailThreadsUsingGoogleAPIs,
        getThread
    }
})()
module.exports = requester;