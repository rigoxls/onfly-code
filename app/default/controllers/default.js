var Default = function(){
    this.response = function(action, req, res, next){
        this[action](req, res, next);
    }
};

Default.prototype.home = function(req, res, next){
    var object = {init: 'show message init'};
    res.render('home', object);
};

module.exports = Default;