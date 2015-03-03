var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var defaultSchema = new Schema({
    roomId: { type: String, require: true },
    content: String,
    comments: [ {
                    username: String,
                    body: String,
                    date: { type: Date, default: Date.now }
              } ],
    users: [ {
                username: String,
                avatar: String,
                email: String
           } ]
});

var DefaultSchema = mongoose.model('Default', defaultSchema);

module.exports = DefaultSchema;