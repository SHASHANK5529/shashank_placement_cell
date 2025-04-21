
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    start: Date,
    end: Date,
    Gender: String,
    href: String,
    CGPA : mongoose.Decimal128,
    branches : [String],
    Roll_numbers : [String]
});

module.exports = mongoose.model('event', eventSchema);
