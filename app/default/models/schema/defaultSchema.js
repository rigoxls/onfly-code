var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var defaultSchema = new Schema({
    roomId: { type: String, require: true },
    content: String,
    comments: [ { body: String, date: { type: Date, default: Date.now } } ],
    emails: [ { type: String, index: { unique: true } } ]
});

var DefaultSchema = mongoose.model('Default', defaultSchema);

module.exports = DefaultSchema;