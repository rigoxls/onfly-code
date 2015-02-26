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
        });

        //on any change on editor we broadcast to all users
        socket.on('editor_change', function(data){
            if(!_.isEmpty(data)){
                if(!_.isEmpty(data.roomId)){
                    roomsArray[data.roomId] = { roomId: data.roomId, content: data.newText };
                }

                socket.broadcast.to(data.roomId).emit('editor_broadcast',
                {
                    newText: data.newText,
                });
            }else{
                console.error("Error emiting event from room is sending an empty value, editor_change");
            }
        });

        //save editor document
        socket.on('save_document', function(data){
            if(!_.isEmpty(data)){
                if(!_.isUndefined(data.roomId)){
                    if(!_.isUndefined(roomsArray[data.roomId])){

                        var dataRoom = {
                            roomId: roomsArray[data.roomId].roomId,
                            content: roomsArray[data.roomId].content
                        };
                        //save current roomId
                        self.model.saveRoom(dataRoom, 'update', function(doc){
                            console.info("object was updated");
                        });

                    }else{
                        console.error("Error, roomId doesn't exist !!");
                    }
                }


            }else{
                console.error("Error emiting event from room is sending an empty value, save_document");
            }
        });

    });

    return io;
}

module.exports = SocketIO;