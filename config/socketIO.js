var Io = require('socket.io');

var SocketIO = function(config){
    config = config || {};

    //this line makes possible listen socket io on browser, /socket.io/socket.io.js
    var io = Io.listen(config.server);

    io.sockets.on('connection', function(socket){

        //create a room
        socket.on('create', function(roomId){
            socket.join(roomId);
        });

        socket.on('editor_change', function(data){
            socket.broadcast.to(data.roomId).emit('editor_broadcast',
                {
                    newText: data.newText,
                });
        });
    });

    return io;
}

module.exports = SocketIO;