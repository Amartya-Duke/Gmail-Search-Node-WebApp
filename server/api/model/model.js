var model = (function() {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;


    var threadSchema = new Schema({
        email: String,
        id: String,
        snippet: String,
        historyId: String,
        messages: [{
            id: String,
            snippet: String,
            labelIds: String,
            internalDate: String,
            mimeType: String
        }]
    });

    var refreshSchema = new Schema({
        email: String,
        threadDownloadedCount: String,
        messageDownloadedCount: String,
        totalThreadCount: String,
        totalMessageCount: String,
        lastRefresh: String
    });

    var selectTable = function(args) {
        if (args == 'threads')
            return mongoose.model('threads', threadSchema);
        if (args == 'refresh')
            return mongoose.model('refresh', refreshSchema);
    }
    var storeThreads = function(email, arrayOfThreads, messageDownloadedCount, threadDownloadedCount, totalMessageCount, totalThreadCount) {

        var threads = selectTable('threads');
        var refresh = selectTable('refresh');
        return new Promise(function(resolve, reject) {
            threads.remove({ email: email }, function(err, data) {
                if (err) {
                    reject('error clearing database', null);
                }
                threads.create(arrayOfThreads, function(err, data) {
                    if (err) {
                        {
                            console.log('error here')
                            reject(err)
                        }
                        return;
                    }
                    console.log("email:" + email);
                    var refreshData = new Date().toDateString() + ' ' + new Date().toLocaleTimeString();

                    refresh.findOneAndUpdate({ email: email }, { lastRefresh: refreshData, messageDownloadedCount: messageDownloadedCount, threadDownloadedCount: threadDownloadedCount, totalMessageCount: totalMessageCount, totalThreadCount: totalThreadCount }, { upsert: true }, function(err, data) {
                        if (err) {
                            console.log(err)
                            reject(err)
                        } else
                            resolve(refreshData)
                    })
                });
            })
        })
    }

    var fetchData = function(email, query, callback) {
        if (query)
            selectTable('threads').find({ $and: [{ snippet: new RegExp(query, "i") }, { email: email }] }, callback);
        else {
            selectTable('threads').find({ email: email }, callback);
        }
    }

    var deleteData = function(email, callback) {
        selectTable('threads').remove({ email: email }, callback);
        selectTable('refresh').remove({ email: email }, function() {});
    }

    function getLastRefresh(email, callback) {
        selectTable('refresh').find({ email: email }, callback);
    }


    return {
        storeThreads,
        fetchData,
        deleteData,
        getLastRefresh
    }
    //  mongod --dbpath "C:\Users\amart_000\Desktop\NodeWebApp\Gmail-Search-Node-WebApp\server\db"
})()
module.exports = model;