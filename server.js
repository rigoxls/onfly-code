var http = require('http'),
    conf = require('./config/conf'),
    expressServer = require('./config/expressServer');

var app = new expressServer();

var server = http.createServer(app.expressServer);

server.listen(conf.port);
