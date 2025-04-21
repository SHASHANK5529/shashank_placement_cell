const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
    username : String,
    Roll_number:{
        type:String,
        required: true
    },
    Password:{
        type:String,
        required:true
    },
    Gender:{
        type:String,
        required:true
    },
    CGPA:{
        type:mongoose.Decimal128,
        required:true
    },
    Name:String,
    Branch : String,
    Admission:Date,
    Year: mongoose.Schema.Types.Number,
    Semester: mongoose.Schema.Types.Number,
    Dob:Date,
    EamcetRank: mongoose.Schema.Types.Number,
    Section:String,
    MainsRank: mongoose.Schema.Types.Number,
    Back_hist: mongoose.Schema.Types.Number,
    tenth: mongoose.Schema.Types.Number
    
});
module.exports = mongoose.model('stu',PostSchema);