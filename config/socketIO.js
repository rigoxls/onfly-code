var Io = require('socket.io'),
    DefaultModel = require('../app/default/models/defaultModel'),
    _ = require('lodash'),
    gRooms = [],
    usersConnected = [];

var SocketIO = function(config){
    var config = config || {};
    var self = this;
    this.model = new DefaultModel();

    //this line makes possible listen socket io on browser, /socket.io/socket.io.js
    var io = Io.listen(config.server);

    io.sockets.on('connection', function(socket){

        //create a room in socket.io , if it does not exists
        //if it exists just join the room
        socket.on('create', function(roomId, userInChat){
            socket.join(roomId);

            var data = { roomId : roomId };
            var uc = userInChat;

            //find room saved previously on controller
            self.model.findByRoomId(data, function(doc){

                var uKey = roomId + uc.userEmail;
                socket.uKey = uKey;

                if(typeof usersConnected[uKey] == 'undefined'){
                    //restore chat and document
                    self.restoreDocument(roomId, doc[0], socket);

                    //add user to usersConnected to avoid user twice in same room
                    usersConnected[uKey] = uc.userEmail;

                    //save in socket current user
                    socket.currentUser = {
                        roomId: roomId,
                        userName: uc.userName,
                        userEmail: uc.userEmail,
                        userAvatar: uc.userAvatar
                    }

                    var joinedUser = {
                        userName: uc.userName,
                        userEmail: uc.userEmail,
                        userAvatar: uc.userAvatar,
                        message: 'has joined this room',
                        type: 'info'
                    };

                    socket.broadcast.to(data.roomId).emit('message_broadcast', joinedUser);
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
                        content: data.newText,
                        mode: data.mode
                    };

                    //update general rooms array to make a persistent temporal data
                    //it's useful to avoid saving on db per every change on document
                    //and have a variable with data of editor for new users that could
                    //join the session
                    gRooms[data.roomId] = data.newText;

                    //save dataRoom on all active sockets
                    //when user disconnect we use this data to save in db
                    var activeSockets = io.sockets.in(data.roomId).sockets;
                    for(var i in activeSockets){
                        activeSockets[i].dataRoom = dataRoom;
                    }
                }

                //broadcast change on document to all active sockets
                socket.broadcast.to(data.roomId).emit('editor_broadcast',
                {
                    newText: data.newText,
                    marker: data.marker,
                    dinamicText: data.dinamicText
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

        socket.on('mode_change', function(data){
            socket.broadcast.to(data.roomId).emit('mode_broadcast', data)
        });

        //when any socket lost connection, 'reload, leave page, etc...'
        socket.on('disconnect', function(){
            //remove user from users connected
            delete usersConnected[socket.uKey];

            //if socket dataRoom means user has changed something in document
            var dataRoom = socket.dataRoom || null;

            if(dataRoom){
                //save editor document
                self.model.saveRoom(dataRoom, 'update', function(doc){
                    console.info("document was updated");
                });

                //active users in room, if undefined remove gRooms var position
                if(io.nsps['/'].adapter.rooms[dataRoom.roomId] !== undefined){
                    delete gRooms[dataRoom.roomId];
                    console.info('gRoom deleted: ' + dataRoom.roomId);
                }
            }

            //send a broadcast message info about user has left the room
            if(socket && socket.currentUser){
                var leftUser = {
                    userName: socket.currentUser.userName,
                    userEmail: socket.currentUser.userEmail,
                    userAvatar: socket.currentUser.userAvatar,
                    message: 'has left this room',
                    type: 'info'
                };

                socket.broadcast.to(socket.currentUser.roomId).emit('message_broadcast', leftUser);
            }

        });

    }); //end socketio connection method

    // this should be in a service , dirty for the moment :(
    this.restoreDocument = function(roomId, doc, socket){

        var data = null,
            messages = doc.messages,
            users = doc.users;
            cleanData = [];

        //set document to current socket
        socket.emit('set_document',
        {
            content: gRooms[doc.roomId] || doc.content,
            mode: doc.mode
        });

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