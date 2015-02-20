var http = require('http'),
    conf = require('./config/conf'),
    expressServer = require('./config/expressServer'),
    socketIO = require('./config/socketIO');

var app = new expressServer();
var server = http.createServer(app.expressServer);
var Io = new socketIO({server: server});

server.listen(conf.port);
