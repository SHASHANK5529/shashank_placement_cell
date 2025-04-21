const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const Stu = require('../models/stu');
const { verify } = require('crypto');
const message_student = require('../models/message_student');
const jwt = require('jsonwebtoken');
const placement = require('../models/placement');
const flash = require('connect-flash');
const message = require('../models/message');
const events = require('../models/event');

const upload = multer({ dest: 'uploads/' });

router.get('/Admin/dashboard',verifyToken, (req, res) => {
    // Parse the token from the query parameter
    const token = req.query.token;
    
    // Verify token and extract user information
    jwt.verify(token, 'keyboard', (err, decoded) => {
        if (err) {
            // Token verification failed
            res.status(401).send('Unauthorized');
        } else {
            // Token verification succeeded
            // You can access user information from the decoded token
            const user = decoded;

            // Render the dashboard page or perform other actions
            res.render('./Admin/dashboard', { token,layout:'./layouts/admin_main' });
        }
    });
});

router.get('/Admin/add_students',verifyToken, async (req,res) => {
    const token = req.query.token;
     // const x = req.session.staff;
      // Verify token and extract user information
      console.log(token);
      jwt.verify(token, 'keyboard', (err, decoded) => {
          if (err) {
              // Token verification failed
              res.status(401).send('Unauthorized');
          } else {
                res.render('Admin/add_students', { token,layout:'./layouts/admin_main'}); 
          }
      });
  });
  
  router.post('/Admin/add_students', verifyToken, upload.single('csvFile'), async (req, res) => {
    let results = [];

    const transformer = new stream.Transform({
        objectMode: true,
        async transform(data, encoding, callback) {
            try {
                const existingStudent = await Stu.findOne({ Roll_number: data.Roll_number });
                if (existingStudent) {
                    console.log(`Student with Roll_number ${data.Roll_number} already exists. Skipping...`);
                    callback(); // Call the callback without any data to skip
                } else {
                    results.push(data);
                    console.log(data);
                    callback(null, data); // Call the callback with data to continue
                }
            } catch (error) {
                callback(error); // Call the callback with an error to stop the pipeline
            }
        }
    });

    try {
        await pipeline(
            fs.createReadStream(req.file.path),
            csv(),
            transformer
        );

        console.log(results);

        if (results.length > 0) {
            await Stu.insertMany(results);
            res.send('Data uploaded successfully');
        } else {
            res.send('No new students to upload');
        }

        fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving data to MongoDB');
    }
});
  
  function verifyToken(req, res, next) {
    const token = req.query.token;
    if (!token) {
      req.flash('error', 'Your session has expired. Please login again.');
      return res.redirect('/placement_login'); // Redirect if token is not provided
    }
    jwt.verify(token, 'keyboard', (err, decoded) => {
      if (err) {
        req.flash('error', 'Your session has expired. Please login again.');
        return res.redirect('/placement_login');
      } // Redirect if token verification fails
      req.decoded = decoded;
      next();
    });
  }


module.exports = router;