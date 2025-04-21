const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    analysis: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('Resume', ResumeSchema);
