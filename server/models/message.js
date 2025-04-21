const mongoose = require('mongoose');

// Define message schema
const messSchema = new mongoose.Schema({
    Roll_number: [String],
    subject: String,
});

module.exports = mongoose.model('message', messSchema);
