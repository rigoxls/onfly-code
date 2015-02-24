var randomToken = require('random-token');
var _ = require('lodash');

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

    console.info("go room entrance");

    //generate token room
    var token = randomToken(30);
    res.redirect('/room/' + token);
}

Default.prototype.room = function(req, res, next, io){

    //if credentials are empty redirect to login zone
    if(_.isEmpty(req.session.userName) || _.isEmpty(req.session.userEmail)){
        res.redirect('/home/');
    }else{
        console.info(req.session.userName);
        console.info(req.session.userEmail);
        var object = {roomId: req.params.id};
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
}

module.exports = Default;