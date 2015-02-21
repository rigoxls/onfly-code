var Io = require('socket.io');

var SocketIO = function(config){
    config = config || {};

    //this line makes possible listen socket io on browser, /socket.io/socket.io.js
    var io = Io.listen(config.server);

    io.sockets.on('connection', function(socket){
        socket.on('editor_change', function(data){
            socket.broadcast.emit('editor_broadcast',
                {
                    newText: data.newText,
                });
        });
    });
}

module.exports = SocketIO;