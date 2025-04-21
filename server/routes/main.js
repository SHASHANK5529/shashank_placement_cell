const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const message_student = require('../models/message_student');
const mongoose = require('mongoose');
router.get('',async(req,res) => {
    res.render('./main/index');

});




router.get('/admin_login',async(req,res) => {
    res.render("./main/admin_login");
});

router.get('/experiences',async(req,res)=>{
    const data = await message_student.find();
    res.render('./main/experiences',{data : data});
})

router.get('/exp/:id', async (req,res)=>{
    try {
    const id = req.params.id; // e.g., getting the id from the route parameter
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
    }
    const data = await message_student.findById({_id : id });
    res.render('./main/exp', {data});
    }
    catch(error){
        console.log(error);
    }
});



router.post('/delete_event/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const token = req.query.token;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('Invalid ID format');
        }
        // Assuming `message_student` is your Mongoose model
        await message_student.findByIdAndDelete(id);
        res.redirect(`/placement/approve?token=${token}`); // Redirect to a suitable URL after deletion
    } catch (error) {
        console.log(error);
        res.status(500).send('Error deleting event');
    }
});



router.get('/about',async(req,res) => {
    res.render("./main/about");
});
module.exports = router;