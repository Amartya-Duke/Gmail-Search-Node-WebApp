var model = (function() {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var threadSchema = new Schema({
        id: String,
        snippet: String,
        historyId: String
    });

    var selectTable = function(args) {
        if (args == 'threads')
            return mongoose.model('threads', threadSchema);
    }
    var storeThreads = function(arrayOfThreads, callback) {

        var threads = selectTable('threads');
        threads.remove({}, function(err, data) {
            if (err) {
                callback('error clearing database', null);
            }
            threads.create(arrayOfThreads, callback);
        })

    }

    return {
        storeThreads
    }
    //  mongod --dbpath "C:\Users\amart_000\Desktop\NodeWebApp\Gmail-Search-Node-WebApp\db"
})()
module.exports = model;