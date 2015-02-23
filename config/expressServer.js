var env = process.env.NODE_EV || 'production',
    express = require('express'),
    swig = require('swig'),
    middlewares = require('../app/middlewares/admin'),
    controllersManager = require('../app/default/controllers/controllersManager'),
    controllers = [];

    var ExpressServer = function(config){
    config = config || {};

    this.expressServer = express();

    //working with middlewares
    for (var middleware in middlewares){
        this.expressServer.use(middlewares[middleware]);
    }

    //tell express we are going to use swing
    this.expressServer.engine('html', swig.renderFile);
    this.expressServer.set('view engine', 'html');

    //where templates are located
    this.expressServer.set('views', __dirname + '/../app/default/views/templates');

    //if environment is equals to development, we disable cache engine
    if(env == 'development'){
        console.info('this is development environment');
        this.expressServer.set('view cache', false);
        swig.setDefaults({cache: false});
    }

    //instance all controllers
    for(var cm in controllersManager){
        controllers[cm] = new controllersManager[cm];
    }

    //define some routes
    this.expressServer.get('/home/', function(req, res, next){
        controllers['default'].response('home', req, res, next);
    });

    this.expressServer.get('/room/', function(req, res, next){
        var object = {init : 'room route'};
        res.render('room', object);
    });

};

module.exports = ExpressServer;