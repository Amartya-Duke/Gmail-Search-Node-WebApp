var rp = require('request-promise');
var path = require('path');
var fs = require('fs');
var google = require('googleapis');
var requester = (function() {

    var THRESHOLD_LIMIT = 30;

    function getOptions(userId, query, type, auth) {

        var options = {
            method: 'GET',
            uri: 'https://www.googleapis.com/gmail/v1/users/' + userId + '/' + type,
            headers: {
                authorization: 'Bearer ' + auth.credentials.access_token,
                'content-type': 'application/json',

            },
            params: {
                q: query
            },
            json: true // Automatically stringifies the body to JSON 
        };
        console.log(JSON.stringify(options))
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


    function storeMessage(userId, token, auth, callback) {

        var progress = 0;
        console.log(' token length :' + token.length)
        if (token.length > THRESHOLD_LIMIT)
            makeAjaxCallInBatches(0, THRESHOLD_LIMIT);
        else
            makeAjaxCallInBatches(0, token.length)
        var i;
        var totalData = [];

        function makeAjaxCallInBatches(initial, till) {
            var promises = [];
            for (i = initial; i < till; i++) {
                promises.push(getMessagesFromThreadId(userId, token[i], auth));
            }
            Promise.all(promises)
                .then(function(data) {
                    progress = (till / token.length) * 100;
                    console.log("progress:" + parseInt(progress) + "%")

                    totalData = totalData.concat(data);
                    if (till == token.length) {
                        console.log('All threads ran successfully');
                        var json = {};
                        json.success = true;
                        json.data = totalData;
                        return callback(json)
                    }
                    var temp = ((token.length - till) > THRESHOLD_LIMIT) ? (THRESHOLD_LIMIT) : (token.length - till);

                    takeBreakAndMakeAsyncCall(till, till + temp);
                })
                .catch(function(err) {
                    console.log('Some threads returned error')
                    var json = {};
                    json.success = false;
                    json.err = JSON.stringify(err);
                    callback(json)
                })
        }


    }


    //making request using the request-promise library
    function retrieveMailThreads(userId, noOfDays, auth, callback) {
        var query = 'after:' + getDate(noOfDays).from.toString();
        var options = getOptions(userId, query, 'threads', auth);
        rp(options)
            .then(function(parsedBody) {
                var result = [];
                result = result.concat(parsedBody.threads);
                storeMessage(userId, result, auth, callback);
                console.log('stored in file')
            })
            .catch(function(err) {
                console.log(err.message)
            });
    }

    function retrieveMailThreadsUsingGoogleAPIs(userId, noOfDays, auth) {
        return new Promise(function(resolve, reject) {
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
                    reject('The API returned an error: ' + err);
                    return;
                }
                result = result.concat(response.threads);
                if (response.nextPageToken)
                    getNextPageOfThreads(response.nextPageToken, result);
                else {
                    storeMessage(userId, result, auth, function(response) {
                        if (response.success)
                            resolve(response);
                        else
                            reject(response);
                    })
                }
            });

            function getNextPageOfThreads(nextPageToken, result) {
                console.log('--------getting token from next page--------')
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
                        storeMessage(userId, result, auth, function(response) {
                            if (response.success)
                                resolve(response);
                            else
                                reject(response);
                        })
                    }
                });
            }
        });


    }

    function getMessagesFromThreadId(userId, thread, auth) {
        var threadId = thread.id;
        return new Promise(function(resolve, reject) {
            var gmail = google.gmail('v1');
            gmail.users.threads.get({
                auth: auth,
                userId: userId,
                id: threadId
            }, function(err, response) {
                var json = {};
                if (err)
                    reject(err)
                else {
                    var messageArray = [];

                    for (var i = 0; i < response.messages.length; i++) {
                        var message = {};
                        message.id = response.messages[i].id;
                        message.snippet = response.messages[i].snippet;
                        messageArray.push(message);
                    }
                    thread.messages = messageArray;

                    resolve(thread);
                }

            })
        })
    }

    return {
        retrieveMailThreads,
        retrieveMailThreadsUsingGoogleAPIs,
        getMessagesFromThreadId
    }
})()
module.exports = requester;