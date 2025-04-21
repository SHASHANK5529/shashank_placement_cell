
const mongoose = require('mongoose');

const PlacementSchema = new mongoose.Schema({
    Username:{
        type:String,
        required: true
    },
    Password:{
        type:String,
        required:true
    },
});

module.exports = mongoose.model('coordinators', PlacementSchema);
