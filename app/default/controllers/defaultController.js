var randomToken = require('random-token'),
    DefaultModel = require('../models/defaultModel'),
    _ = require('lodash');

var Default = function(){
    this.response = function(action, req, res, next, io){
        this[action](req, res, next, io);
    }
};

Default.prototype.home = function(req, res, next, io){
    var object = {init: 'show message init'};
    res.render('home', object);
};

Default.prototype.go_room = function(req, res, next, io){

    req.session.userName = req.body.username || {};
    req.session.userEmail = req.body.email || {};
    req.session.roomId = null;

    console.info("go room entrance");
    this.model.save(data, function(doc){

    });

    //generate token room
    var token = randomToken(30);
    res.redirect('/room/' + token);
}

Default.prototype.room = function(req, res, next, io){

    var roomId = req.params.id;

    //if no room id, go directly to login
    if(_.isUndefined(roomId)){
        res.redirect('/home/');
    }

    //if credentials are empty redirect to login zone
    if(_.isEmpty(req.session.userName) || _.isEmpty(req.session.userEmail)){
        res.redirect('/home/' + roomId);
    }
    //user is trying to create another session that current one
    else if(req.session.roomId !== null && req.session.roomId !== roomId){
        req.session.destroy();
        res.redirect('/home/');
    }
    //assign session->roomId and show room
    else{
        console.info(req.session.userName);
        console.info(req.session.userEmail);
        req.session.roomId = roomId;
        var object = {roomId: roomId};
        res.render('room', object);
    }

//toi check with sockets
/*    Io.sockets.on('connection', function(socket){
        socket.on('editor_change', function(data){
            socket.broadcast.emit('editor_broadcast',
                {
                    newText: '45454646546546546465464',
                });
        });
    });*/
};

module.exports = Default;