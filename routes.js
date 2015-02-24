var controllersManager = require('./app/default/controllers/controllersManager');

var Routes = function(app, io){
    var controllers = [];

    var io = io;

    //instance all controllers
    for(var cm in controllersManager){
        controllers[cm] = new controllersManager[cm];
    }

    app.expressServer.get('/home/', function(req, res, next){
        controllers['defaultController'].response('home', req, res, next, io);
    });

    app.expressServer.post('/go_room/', function(req, res, next){
        console.info(req.body);
        controllers['defaultController'].response('go_room', req, res, next);
    });

    app.expressServer.get('/room/:id', function(req, res, next){
        controllers['defaultController'].response('room', req, res, next, io);
    });
}

module.exports = Routes;