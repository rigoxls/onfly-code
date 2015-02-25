var modelDefault = require('./schema/defaultSchema'),
    mongoose = require('mongoose');

var DefaultModel = function(conf){
    conf = conf || {};
    this.model = modelDefault;
};

DefaultModel.prototype.save = function(data, callback){
    this.model.findOneAndUpdate({
        content: data.content
    }, data, { upsert: true }).exec(function(err, doc){
        callback();
    });
};

module.exports = DefaultModel;