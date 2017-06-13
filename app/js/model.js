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
        }],
        historyId: String
    });

    var selectTable = function(args) {
        if (args == 'threads')
            return mongoose.model('threads', threadSchema);
    }
    var storeThreads = function(arrayOfThreads, callback) {
        // console.log(arrayOfThreads)
        var threads = selectTable('threads');
        threads.remove({}, function(err, data) {
            if (err) {
                callback('error clearing database', null);
            }
            threads.create(arrayOfThreads, callback);
        })

    }

    var fetchData = function(callback) {
        selectTable('threads').find(callback);
    }

    return {
        storeThreads,
        fetchData
    }
    //  mongod --dbpath "C:\Users\amart_000\Desktop\NodeWebApp\Gmail-Search-Node-WebApp\db"
})()
module.exports = model;