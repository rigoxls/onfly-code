var _ = require('lodash');

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

    var min = 10000000;
    var max = 90000000;

    //generate token room
    var token = Math.floor(Math.random() * (max - min + 1)) + min;
    res.redirect('/room/' + token);
}

Default.prototype.room = function(req, res, next){
    var object = {init: 'show message init'};
    res.render('room', object);
}

module.exports = Default;