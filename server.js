var http = require('http'),
    conf = require('./config/conf'),
    expressServer = require('./config/expressServer'),
    socketIO = require('./config/socketIO');

var app = new expressServer();
var server = http.createServer(app.expressServer);
var Io = new socketIO({server: server});

//init routes,
//we need to pass Io to use it on the entire application
require('./routes.js')(app, Io);

server.listen(conf.port);
