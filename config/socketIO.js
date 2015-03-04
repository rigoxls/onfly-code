var Io = require('socket.io'),
    DefaultModel = require('../app/default/models/defaultModel'),
    _ = require('lodash'),
    roomsArray = [],
    usersObject = {};

var SocketIO = function(config){
    var config = config || {};
    var self = this;
    this.model = new DefaultModel();

    //this line makes possible listen socket io on browser, /socket.io/socket.io.js
    var io = Io.listen(config.server);

    io.sockets.on('connection', function(socket){

        //create a room
        socket.on('create', function(roomId){
            socket.join(roomId);

            var data = { roomId : roomId };

            self.model.findByRoomId(data, function(doc){
                self.restoreChat(roomId, doc[0], socket);
                //without broadcast cause we need update our own document if refresh or
                //we are opening an old document

                //It broadcasts the data to all
                // sockets clients which are connected to the room even our room
                // socket.broadcast.to only send data to all clientes except socket sender
                socket.emit('set_session',
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
                            userEmail: data.userEmail,
                            message: data.message
                       }
                }
            };

            //save message
            self.model.saveRoom(dataRoom, 'update', function(doc){
                console.info("message saved");
            });

        });

    }); //end socketio connection method

    // this should be in a service , dirty for the moment :(
    this.restoreChat = function(roomId, doc, socket){

        var data = null,
            messages = doc.messages,
            users = doc.users;
            cleanData = [];

        //load users
        for(var i in users){
            if(typeof usersObject[users[i].email] === 'undefined'){
                usersObject[users[i].email] = users[i];
            }
        }

        //link users with messages
        for(var k in messages){
            if(typeof messages[k].userEmail !== 'undefined'){
                if(typeof usersObject[messages[k].userEmail] !== 'undefined'){
                    cleanData[k] = {
                        message: {
                            content: messages[k].message,
                            date: messages[k].date
                        },
                        user: usersObject[messages[k].userEmail]
                    };
                }
            }
        }

        //emit event to socket emisor
        socket.emit('set_chat_messages', cleanData);
    };

    return io;
}

module.exports = SocketIO;