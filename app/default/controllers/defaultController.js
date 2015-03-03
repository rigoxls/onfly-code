var randomToken = require('random-token'),
    DefaultModel = require('../models/defaultModel'),
    _ = require('lodash');

var Default = function(){

    this.model = new DefaultModel();

    this.response = function(action, req, res, next, io){
        this[action](req, res, next, io);
    }
};

Default.prototype.home = function(req, res, next, io){

    var roomId = req.params.id || 0;

    var object = {roomId: roomId};
    res.render('home', object);
};

Default.prototype.go_room = function(req, res, next, io){

    var self = this;

    req.session.userName = req.body.username || {};
    req.session.userEmail = req.body.email || {};
    req.session.roomId = null;

    //if bad data were sent, unless userName and userEmail are needed
    if( !_.isString( req.session.userName ) && !_.isString(req.session.userEmail) ){
        res.redirect('/home/');
    }else{
        //if not email redirects to home
        var testEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!testEmail.test(req.session.userEmail)){
            res.redirect('/home/');
        }
    }

    var data = { roomId : req.body.roomId };
    var dataRoom = {
                       userName: req.session.userName,
                       userEmail: req.session.userEmail,
                       userAvatar: self.setUserAvatar()
                   };

    this.model.findByRoomId(data, function(doc){

        if(!_.isEmpty(doc)){
            dataRoom.roomId = req.body.roomId;
            //check if user is registered already in room
            self.findUserInRoom( dataRoom, res );

        }else{
            //if empty that means it is a new session
            var token = randomToken(30);
            dataRoom.roomId = token;

            //save room local method
            self.saveRoom( dataRoom );
            res.redirect('/room/' + token);
        }
    });
};

//check if user already was saved in room
//if not save it, else just redirect it
Default.prototype.findUserInRoom = function(data, res){

    var self = this;

    this.model.findUserInRoom(data, function(doc){

        if(!_.isEmpty(doc[0].users)){
            //redirect user
            res.redirect('/room/' + data.roomId);
        }else{
            //insert new user
            var dataRoom = {
                roomId: data.roomId,
                $push: {
                        'users': {
                            username: data.userName,
                            email: data.userEmail,
                            avatar: data.userAvatar
                       }
                }
            };

            //update room with new user info
            self.model.saveRoom(dataRoom, 'update', function(doc){
                console.info("user inserted in room");
                res.redirect('/room/' + data.roomId);
            });
        }

    });
};

Default.prototype.saveRoom = function(data){
    //save current roomId
    this.model.saveRoom(data, 'insert', function(doc){
        console.info("object was saved");
    });
};

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
        req.session.roomId = roomId;
        var object = {roomId: roomId};
        res.render('room', object);
    }
};

Default.prototype.setUserAvatar = function(){
    return '/icons/' + parseInt(Math.random() * (28 - 1) + 1) + '.png';
};

module.exports = Default;