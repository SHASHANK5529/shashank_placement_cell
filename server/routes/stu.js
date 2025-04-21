const express = require('express');
const router = express.Router();
const Student = require('../models/stu');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const multer = require('multer');
const Event = require('../models/event');
const Message = require('../models/message');
const message_student = require('../models/message_student');
const Resume = require('../models/Resume');
const path = require('path');


const fs = require('fs');

/*

const analyzeResume = async (filePath) => {
  // Your logic to analyze the resume
  // For example:
  return new Promise((resolve, reject) => {
      // Simulating resume analysis
      setTimeout(() => {
          resolve('Resume analysis result');
      }, 1000);
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'server/uploads'); // Specify the destination folder
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('resume'), async (req, res) => {
  const uploadPath = req.file.path;
  try {
      const analysisResult = await analyzeResume(uploadPath);
      res.send(`File uploaded and analyzed successfully. Result: ${analysisResult}`);
  } catch (error) {
      res.status(500).send('Error analyzing resume');
  }
});





// Handle file upload route
app.post('/upload', upload.single('resume'), (req, res) => {
  // File has been uploaded successfully
  res.send('File uploaded successfully.');
});
router.get('/', (req, res) => {
    res.render('view_profile');
});

router.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let resumeFile = req.files.resume;
    const uploadPath = path.join(__dirname, '../uploads/', resumeFile.name);

    // Save the file to the uploads directory
    resumeFile.mv(uploadPath, async (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Analyze the resume using the Python script
        const analysisResult = await analyzeResume(uploadPath);

        // Save the result to the database
        const newResume = new Resume({
            filename: resumeFile.name,
            analysis: analysisResult,
        });

        await newResume.save();

        res.send('File uploaded and analyzed!');
    });
});

router.get('/view_profile', async (req, res) => {
  try {
    // Retrieve student details based on logged-in user's credentials
    const Roll_numberAsString = req.session.student.Roll_number;
    const student = await Student.findOne({ Roll_number:Roll_numberAsString });
    const token = req.query.token;
    console.log(student);
    if (!student) {
      // If student is not found, render an error page or redirect to a different route
      return res.status(404).send('Student not found.');
    }
    
    // Render the student profile view template with student details
    res.render('Student/view_profile', { student,token,layout:'./layouts/student_main'  });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching student profile.');
  }
});

router.post('/upload', upload.single('resume'), async (req, res) => {
  const uploadPath = req.file.path;
  try {
      const analysisResult = await analyzeResume(uploadPath);
      res.send(`File uploaded and analyzed successfully. Result: ${analysisResult}`);
  } catch (error) {
      res.status(500).send('Error analyzing resume');
  }
});  */


router.get('/view_profile', async (req, res) => {
  try {
    // Retrieve student details based on logged-in user's credentials
    const Roll_numberAsString = req.session.student.Roll_number;
    const student = await Student.findOne({ Roll_number:Roll_numberAsString });
    const token = req.query.token;
    console.log(student);
    if (!student) {
      // If student is not found, render an error page or redirect to a different route
      return res.status(404).send('Student not found.');
    }
    
    // Render the student profile view template with student details
    res.render('Student/view_profile', { student,token,layout:'./layouts/student_main'  });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching student profile.');
  }
});
router.get('/Dashboard', async (req, res) => {
  try {
    // Retrieve student details based on logged-in user's credentials
    const Roll_numberAsString = req.session.student.Roll_number;
    const x = await Student.findOne({ Roll_number:Roll_numberAsString });
    const token = req.query.token;
    console.log(x);
    if (!x) {
      // If student is not found, render an error page or redirect to a different route
      return res.status(404).send('Student not found.');
    }
    
    // Render the student profile view template with student details
    res.render('Student/Dashboard', { x,token,layout:'./layouts/student_main'  });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching student profile.');
  }
});


router.get('/events', async (req, res) => {
  try {
 
      const studentGender = req.session.student.Gender;
      const studentCGPA = req.session.student.CGPA;
      const studentRoll = req.session.student.Roll_number;
      const studentbranch = req.session.student.Branch;
      console.log(studentCGPA);
      const events = await Event.find({
        $and: [
            { $or: [{ Gender: studentGender }, { Gender: 'All' }] },
            { CGPA: { $lte: studentCGPA } },
            { $or: [{ Roll_numbers: studentRoll }, { Roll_numbers: 'All' }]},
            { $or: [{branches : studentbranch}, {branches: 'All'}] }
        ]
    });

      const formattedEvents = events.map(event => ({
          title: event.title,
          start: event.start,
          end: event.end,
          href: event.href,
          Gender: event.Gender,
          CGPA: event.CGPA,
          Roll_numbers:event.Roll_numbers,
          branches:event.branches
      }));
      res.json(formattedEvents);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

  router.get('/Student/mainpage', (req, res) => {
    // Parse the token from the query parameter
    const token = req.query.token;
    const x = req.session.student;
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
            res.render('./Student/mainpage', { x,token,layout:'./layouts/student_main' });
        }
    });
});

router.get('/mainpage', async(req,res)=>{
  const x = req.session.student;
  const token = req.query.token;
  res.render('./Student/mainpage', { x,token,layout:'./layouts/student_main' });
})

router.get('/inbox', async(req, res) => {
  try {
      const x = req.session.student;
      const token = req.query.token;
      const messages = await Message.find();
      const messages_students = await message_student.find();
      res.render('./Student/inbox',{messages_students,token,x : x,messages,layout:'./layouts/student_main'});
  } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
  }
});
router.post('/inbox', async (req, res) => {
  try {
      const { Roll_number, Event_name, Title, Body, Completed } = req.body;
      console.log(req.body);
      const newUser = new message_student({ Roll_number, Event_name, Title, Body, Completed });
      await newUser.save(); // Save new message/student record to the database

      // Send a JSON response back to indicate success
      res.status(201).json({ message: 'Feedback form submitted successfully' });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Failed to submit feedback form' });
  }
});





// Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save files to 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save the file with the original name
    }
});

const upload = multer({ storage: storage });

const analyzeResume = async (filePath) => {
  // Simulating resume analysis
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve('Resume analysis result');
      }, 1000);
  });
};

// Handle file upload route
app.post('/upload', upload.single('resume'), async (req, res) => {
    const uploadPath = req.file.path;
    try {
        const analysisResult = await analyzeResume(uploadPath); // Ensure analyzeResume is defined
        res.send(`
        <h1>File uploaded and analyzed successfully</h1>
        <p>Analysis Result: ${analysisResult}</p>
        <a href="/">Go back</a>
    `);
    } catch (error) {
        res.status(500).send('Error analyzing resume');
    }
});

// Serve the upload form
app.get('/', (req, res) => {
    res.send(`
        <form method="post" action="/upload" enctype="multipart/form-data">
            <input type="file" name="resume" required>
            <input type="submit" value="Upload Resume">
        </form>
    `);
});

router.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
  }

  let resumeFile = req.files.resume;
  const uploadPath = path.join(__dirname, '../uploads/', resumeFile.name);

  // Save the file to the uploads directory
  resumeFile.mv(uploadPath, async (err) => {
      if (err) {
          return res.status(500).send(err);
      }

      // Analyze the resume using the Python script
      const analysisResult = await analyzeResume(uploadPath);

      // Save the result to the database
      const newResume = new Resume({
          filename: resumeFile.name,
          analysis: analysisResult,
      });

      await newResume.save();

      res.send(`
        <h1>File uploaded and analyzed successfully</h1>
        <p>Analysis Result: ${analysisResult}</p>
        <a href="/">Go back</a>
    `);
  });
});




module.exports = router;