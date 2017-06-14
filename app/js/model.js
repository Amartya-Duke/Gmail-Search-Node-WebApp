var model = (function() {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var threadSchema = new Schema({
        id: String,
        snippet: String,
        historyId: String,
        messages: [{
            id: String,
            snippet: String
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
    var storeThreads = function(arrayOfThreads, callback) {
        // console.log(arrayOfThreads)
        var threads = selectTable('threads');
        var refresh = selectTable('refresh');
        threads.remove({}, function(err, data) {
            if (err) {
                callback('error clearing database', null);
            }
            threads.create(arrayOfThreads, callback);
            refresh.create({ lastRefresh: new Date().toDateString() + ' ' + new Date().toLocaleTimeString() }, function(err, data) {
                if (err)
                    console.log(err)
                else
                    console.log('refresh data stored')
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
    //  mongod --dbpath "C:\Users\amart_000\Desktop\NodeWebApp\Gmail-Search-Node-WebApp\db"
})()
module.exports = model;