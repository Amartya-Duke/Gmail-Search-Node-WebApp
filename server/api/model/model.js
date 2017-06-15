var model = (function() {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var threadSchema = new Schema({
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
        lastRefresh: String
    });
    var selectTable = function(args) {
        if (args == 'threads')
            return mongoose.model('threads', threadSchema);
        if (args == 'refresh')
            return mongoose.model('refresh', refreshSchema);
    }
    var storeThreads = function(arrayOfThreads) {

        var threads = selectTable('threads');
        var refresh = selectTable('refresh');
        return new Promise(function(resolve, reject) {
            threads.remove({}, function(err, data) {
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
                    var refreshData = new Date().toDateString() + ' ' + new Date().toLocaleTimeString();
                    refresh.create({ lastRefresh: refreshData }, function(err, data) {
                        if (err) {
                            console.log('error here d')
                            reject(err)
                        } else
                            resolve(refreshData)
                    })
                });

            })
        })


    }

    var fetchData = function(query, callback) {
        if (query)
            selectTable('threads').find({ snippet: new RegExp(query, "i") }, callback);
        else {
            selectTable('threads').find(callback);
        }
    }

    var deleteData = function(callback) {
        selectTable('threads').remove({}, callback);
        selectTable('refresh').remove({}, function() {});
    }

    function getLastRefresh(callback) {
        selectTable('refresh').find(callback);
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