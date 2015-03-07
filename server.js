var http = require('http'),
    conf = require('./config/conf'),
    mongoose = require('mongoose'),
    expressServer = require('./config/expressServer'),
    socketIO = require('./config/socketIO'),
    env = process.env.NODE_ENV || 'production',
    mLab = conf.mongoLab;


if(env == 'development'){
    mongoose.connect('mongodb://' + conf.mongoDB.host + '/' + conf.mongoDB.name);
}else{
    mongoose.connect('mongodb://' + mLab.user + ':' + mLab.password + '@' + mLab.host + '/' + mLab.name);
}

var app = new expressServer();
var server = http.createServer(app.expressServer);
var Io = new socketIO({server: server});

//init routes,
//we need to pass Io to use it on the entire application
require('./routes.js')(app, Io);

server.listen(conf.port);
