var randomToken = require('random-token');

var Default = function(){
    this.response = function(action, req, res, next){
        this[action](req, res, next);
    }
};

Default.prototype.home = function(req, res, next){
    var object = {init: 'show message init'};
    res.render('home', object);
};

Default.prototype.go_room = function(req, res, next){

    //generate token room
    var token = randomToken(30);
    res.redirect('/room/' + token);
}

Default.prototype.room = function(req, res, next){
    var object = {init: 'show message init'};
    res.render('room', object);
}

module.exports = Default;