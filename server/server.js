var io = require('socket.io').listen(8888);
var MongoClient = require('mongodb').MongoClient;

var users = [];

function Server(db, socket) {
    var server = this;

    this.currentUser = '';


    socket.on('message', function (text) {
        var message = composeMessage(text);
        db.insert(message, function () {
            // TODO handle errors
        });
        io.sockets.emit('message', message);
    });

    socket.on('login', function (username, callback) {
        var success = false;
        if (users.indexOf(username) < 0) {
            server.currentUser = username;
            users.push(username);
            success = true;
        }
        callback(success);

        if (success) {
            socket.emit('message', composeSystemMessage('Hi ' + server.currentUser + '! Welcome to the chat!'));
            socket.broadcast.emit('message', composeSystemMessage(server.currentUser + ' has joined the conversation.'));
            db.find({}, {limit: 10, sort:{date: -1}}).toArray(function (err, results) {
                console.log(results);
                socket.emit('message', results);
            });
        }
    });

    socket.on('disconnect', function () {
        users.splice(users.indexOf(server.currentUser), 1);
        io.sockets.emit('message', composeSystemMessage(server.currentUser + ' has left the conversation.'));
    });

    // Private
    var composeMessage = function (text) {
        return {date: (new Date()).getTime(), user: server.currentUser, text: text, type: 'user'}
    };
    var composeSystemMessage = function (text) {
        return {date: (new Date()).getTime(), text: text, type: 'system'}
    };

};

MongoClient.connect("mongodb://localhost:27017/test", function (err, db) {
    var collection = db.collection('test');

    io.sockets.on('connection', function (socket) {
        new Server(collection, socket);
    });


});

//setInterval(function() {
//    io.sockets.emit('message', "tick");
//}, 1000 );