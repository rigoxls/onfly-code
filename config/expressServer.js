var env = process.env.NODE_ENV || 'production',
    express = require('express'),
    swig = require('swig'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    middlewares = require('../app/middlewares/admin');


    var ExpressServer = function(config){
        config = config || {};

        this.expressServer = express();

        this.expressServer.use(bodyParser.urlencoded({extended: true}));

        this.expressServer.use(session({
          secret: 'onflycode-session-secret',
          resave: false,
          saveUninitialized: false
        }));

        //working with middlewares
        for (var middleware in middlewares){
            this.expressServer.use(middlewares[middleware]);
        }

        //tell express we are going to use swing
        this.expressServer.engine('html', swig.renderFile);
        this.expressServer.set('view engine', 'html');
        swig.setDefaults({ varControls: ['[[' , ']]'] });

        //where templates are located
        this.expressServer.set('views', __dirname + '/../app/default/views/templates');

        //if environment is equals to development, we disable cache engine
        if(env == 'development'){
            console.info('this is development environment');
            this.expressServer.set('view cache', false);
            swig.setDefaults({cache: false, varControls: ['[[' , ']]']});
        }else{
            console.info(env);
            console.info('mienda');
        }
};

module.exports = ExpressServer;