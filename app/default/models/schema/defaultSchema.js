var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var defaultSchema = new Schema({
    roomId: { type: String, require: true },
    content: String,
    mode: String,
    messages: [ {
                    userEmail: String,
                    message: String,
                    date: { type: Date, default: Date.now }
              } ],
    users: [ {
                name: String,
                avatar: String,
                email: String
           } ]
});

var DefaultSchema = mongoose.model('Default', defaultSchema);

module.exports = DefaultSchema;