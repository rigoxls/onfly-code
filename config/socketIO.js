var Io = require('socket.io'),
    DefaultModel = require('../app/default/models/defaultModel'),
    _ = require('lodash'),
    roomsArray = [];

var SocketIO = function(config){
    config = config || {};
    self = this;
    this.model = new DefaultModel();

    //this line makes possible listen socket io on browser, /socket.io/socket.io.js
    var io = Io.listen(config.server);

    io.sockets.on('connection', function(socket){

        //create a room
        socket.on('create', function(roomId){
            socket.join(roomId);

            var data = { roomId : roomId };

            self.model.findByRoomId(data, function(doc){
                //without broadcast cause we need update our own document if refresh or
                //we are opening an old document

                //It broadcasts the data to all
                // sockets clients which are connected to the room even our room
                // socket.broadcast.to only send data to all clientes except socket sender
                io.sockets.in(data.roomId).emit('set_session',
                {
                    content: doc[0].content
                });
            });

        });

        //on any change on editor we broadcast to all users
        socket.on('editor_change', function(data){
            if(!_.isEmpty(data)){
                if(!_.isEmpty(data.roomId)){
                    roomsArray[data.roomId] = { roomId: data.roomId, content: data.newText };

                    var dataRoom = {
                        roomId: roomsArray[data.roomId].roomId,
                        content: roomsArray[data.roomId].content
                    };

                    //save editor document
                    self.model.saveRoom(dataRoom, 'update', function(doc){
                        console.info("object was updated");
                    });
                }

                socket.broadcast.to(data.roomId).emit('editor_broadcast',
                {
                    newText: data.newText,
                });
            }else{
                console.error("Error emiting event from room is sending an empty value, editor_change");
            }
        });

        //send message to all users
        socket.on('message_send', function(data){
            socket.broadcast.to(data.roomId).emit('message_broadcast', data);

            var dataRoom = {
                roomId: data.roomId,
                $push: {
                        'messages': {
                            username: data.userName,
                            message: data.message,
                       }
                }
            };

            //save message
            self.model.saveRoom(dataRoom, 'update', function(doc){
                console.info("message saved");
            });

        });

    });

    return io;
}

module.exports = SocketIO;