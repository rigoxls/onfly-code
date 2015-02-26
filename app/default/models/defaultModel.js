var modelDefault = require('./schema/defaultSchema'),
    mongoose = require('mongoose');

var DefaultModel = function(conf){
    conf = conf || {};
    this.model = modelDefault;
};


DefaultModel.prototype.findByRoomId = function(data, callback){
    this.model.find(data, function(err, doc){
        callback(doc);
    });
};

DefaultModel.prototype.saveRoom = function(data, method, callback){

    if(method === 'insert'){
        var data = { roomId: data.roomId, content: '' };
        var cM = new modelDefault(data);

        cM.save(function(err, data){
            if (err) return console.error(err);
            callback();
        });
    }
    else if(method === 'update'){
        //this.model.findOneAndUpdate(query, update, options, function(err, doc)
        this.model.findOneAndUpdate({
            roomId: data.roomId
        }, data, { upsert: false }).exec(function(err, doc){
            callback();
        });
    }
};

module.exports = DefaultModel;