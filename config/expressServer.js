var env = process.env.NODE_EV || 'production',
    express = require('express'),
    swig = require('swig'),
    middlewares = require('./middlewares/admin'),

var ExpressServer = function(config){
    config = config || {};

    this.expressServer = express();

    //working with middlewares
    for (var middleware in middleware){
        this.expressServer.use(middlewares[middleware]);
    }

    //tell express we are going to use swing
    this.expressServer.engine('html', swig.renderFile);
    this.expressServer.set('view engine', 'html');

    //where templates are located
    this.expressServer.set('views', __dirname + '/app/views/templates');

    //if environment is equals to development, we disable cache engine
    if(env == 'development'){
        console.info('this is development environment');
        this.expressServer.set('view cache', false);
        swig.setDefaults({cache: false});
    }

    //define some static routes
    this.expressServer.get('/home/', function(req, res, next){
        var object = {init: 'show message init'};
        res.render('home', object);
    });
};

module.exports = ExpressServer;