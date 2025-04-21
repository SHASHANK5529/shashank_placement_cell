const mongoose = require('mongoose');

// Define message schema
const messageSchema = new mongoose.Schema({
    Roll_number: {
        type:String,
        required:true
    },
    Event_name:{
        type:String,
        required:true
    },
    Title : String,
    Body: String,
    Completed: String,
    createAt :{
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('message_student', messageSchema);
