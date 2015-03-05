var Io = require('socket.io'),
    DefaultModel = require('../app/default/models/defaultModel'),
    _ = require('lodash'),
    usersConnected = [];

var SocketIO = function(config){
    var config = config || {};
    var self = this;
    this.model = new DefaultModel();

    //this line makes possible listen socket io on browser, /socket.io/socket.io.js
    var io = Io.listen(config.server);

    io.sockets.on('connection', function(socket){

        socket.on('disconnect', function(){
            //remove user from users connected
            delete usersConnected[socket.uKey];
        });

        //create a room if it does not exists
        socket.on('create', function(roomId, userEmail){
            socket.join(roomId);

            var data = { roomId : roomId };

            self.model.findByRoomId(data, function(doc){
                self.restoreChat(roomId, doc[0], socket);


                var uKey = roomId + userEmail;
                socket.uKey = uKey;

                if(typeof usersConnected[uKey] == 'undefined'){
                    //emit to current socket
                    socket.emit('set_session',
                    {
                        content: doc[0].content
                    });

                    //add user to usersConnected to avoid user twice in same room
                    usersConnected[uKey] = userEmail;
                }
                else{
                    //users is trying to sign in twice in same room
                    socket.emit('invalid_session');
                }

            });

        });

        //on any change on editor we broadcast to all users
        socket.on('editor_change', function(data){
            if(!_.isEmpty(data)){
                if(!_.isEmpty(data.roomId)){

                    var dataRoom = {
                        roomId: data.roomId,
                        content: data.newText
                    };

                    //save editor document
                    self.model.saveRoom(dataRoom, 'update', function(doc){
                        console.info("document was updated, need to improve");
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

        //search users into doc, and create a simple array with them
        for(var i in users){
            if(typeof socket[users[i].email] === 'undefined'){
                socket[users[i].email] = users[i];
            }
        }

        //link users with messages
        for(var k in messages){
            if(typeof messages[k].userEmail !== 'undefined'){
                if(typeof socket[messages[k].userEmail] !== 'undefined'){
                    cleanData[k] = {
                        message: {
                            content: messages[k].message,
                            date: messages[k].date
                        },
                        user: socket[messages[k].userEmail]
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