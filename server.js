var http = require('http'),
    conf = require('./config/conf'),
    mongoose = require('mongoose'),
    expressServer = require('./config/expressServer'),
    socketIO = require('./config/socketIO');

mongoose.connect('mongodb://' + conf.mongoDB.host + '/' + conf.mongoDB.name);

var app = new expressServer();
var server = http.createServer(app.expressServer);
var Io = new socketIO({server: server});

//init routes,
//we need to pass Io to use it on the entire application
require('./routes.js')(app, Io);

server.listen(conf.port);
