var lToken = require('token');
lToken.defaults.secret = 'OFC2015R';

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
    var tokenString = req.body.email + '' + Math.floor(Math.random()*1000);
    var token = lToken.generate(tokenString).replace('/','');
    res.redirect('/room/' + token);
}

Default.prototype.room = function(req, res, next){
    var object = {init: 'show message init'};
    res.render('room', object);
}

module.exports = Default;