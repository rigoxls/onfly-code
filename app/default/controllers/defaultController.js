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
    var errorMessage = (roomId == 'invalid_session') ? 'You have another session started !!' : '';

    var object = {roomId: roomId, errorMessage: errorMessage};
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

    //search room by id
    //note users cannot create default rooms, ex: /home/my_default_room
    this.model.findByRoomId(data, function(doc){
        //room was created before
        if(!_.isEmpty(doc)){
            dataRoom.roomId = doc[0].roomId;
            //check if user is registered already in room
            self.findUserInRoom( dataRoom, req, res );
        }
        else{
            //if empty that means it is a new session
            var token = randomToken(30);
            dataRoom.roomId = token;

            //set avatar
            req.session.userAvatar = dataRoom.userAvatar;

            //save room local method
            self.saveRoom( dataRoom );
            res.redirect('/room/' + token);
        }
    });
};

//check if user already was saved in room
//if not save it, else just redirect it
Default.prototype.findUserInRoom = function(data, req, res){

    var self = this;

    this.model.findUserInRoom(data, function(doc){
        //user already was in room
        if(!_.isEmpty(doc[0].users)){

            //setting avatar
            if(typeof(doc[0].users[0].avatar) !== 'undefined'){
                req.session.userAvatar = doc[0].users[0].avatar;
            }
            else{
                req.session.userAvatar = '';
            }
            //redirect user
            res.redirect('/room/' + data.roomId);
        }
        else{
            //insert new user
            var dataRoom = {
                roomId: data.roomId,
                $push: {
                        'users': {
                            name: data.userName,
                            email: data.userEmail,
                            avatar: data.userAvatar
                       }
                }
            };

            req.session.userAvatar = data.userAvatar;

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
        req.session.destroy();
        res.redirect('/home/');
    }

    //if credentials are empty redirect to login zone
    if(_.isEmpty(req.session.userName) || _.isEmpty(req.session.userEmail)){
        req.session.destroy();
        res.redirect('/home/' + roomId);
    }
    //user is trying to create another session that current one
    else if(req.session.roomId !== null && req.session.roomId !== roomId){
        req.session.destroy();
        res.redirect('/home/invalid_session');
    }
    //assign session->roomId and show room
    else{
        req.session.roomId = roomId;
        var object = {
            roomId: roomId,
            userName: req.session.userName,
            userAvatar: req.session.userAvatar,
            userEmail: req.session.userEmail
        };
        res.render('room', object);
    }
};

Default.prototype.setUserAvatar = function(){
    return '/icons/' + parseInt(Math.random() * (49 - 1) + 1) + '.png';
};

module.exports = Default;