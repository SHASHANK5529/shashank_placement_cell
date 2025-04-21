const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const placement = require('../models/placement');
const flash = require('connect-flash');
const message = require('../models/message');
const events = require('../models/event');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Stu = require('../models/stu');
const { verify } = require('crypto');
const message_student = require('../models/message_student');
const { parse } = require('path');
router.use(flash());
// Define route to fetch fruits
const mongoose = require('mongoose');
const upload = multer({ dest: 'uploads/' });

router.get('/student/events', async (req, res) => {
  try {
    // Find all fruits and only select the 'name' field
    const Event = await events.find().select('title');
    res.json(Event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/updatePost', verifyToken, async (req, res) => {
  try {
      const { postId } = req.body;
      const token = req.query.token;
      console.log('Received update request for post:', postId, 'with Completed:', "off");
      
      const post = await message_student.findByIdAndUpdate(postId, { Completed: "off" }, { new: true });
      if (!post) {
          console.error('Post not found:', postId);
          return res.status(404).send({ error: 'Post not found',postId });
      }
      res.redirect(`/placement/approve?token=${token}`);
  } catch (error) {
      res.send('Error updating post:', error);
      res.status(500).send({ error: 'Internal server error' });
  }
});





router.get('/placement/ex/:id',verifyToken ,async (req,res)=>{
  try {
  let slug = req.params.id;
  const token = req.query.token;
  const x = req.session.staff;
  const data = await message_student.findById({_id : slug });
  res.render('./main/ex', { data,token,layout:'./layouts/placement_main'});
  }
  catch(error){
      console.log(error);
  }
});

router.get('/placement/approve',verifyToken,async(req,res) => {
      const token = req.query.token;
      const x = req.session.staff;
      const data = await message_student.find();
      res.render('./placement/approve',{ x:x,data,token,layout:'./layouts/placement_main'} );
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

router.post('/placement/create_students',verifyToken, upload.single('csvFile'), async (req, res) => {
  let results = [];
  let isFirstRow = true; 
  fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async(data) => {
        const existingStudent = await Stu.findOne({ Roll_number: data.Roll_number });
        if (existingStudent) {
            console.log(`Student with Roll_number ${data.Roll_number} already exists. Skipping...`);
        }
        else{
          // Log each row of data to the console
          console.log(data);
          results.push(data);
        }
      })
      .on('end', async () => {
          try {
              // Save data to MongoDB
              await Stu.insertMany(results);
              res.send('Data uploaded successfully');
              fs.unlinkSync(req.file.path);
          } catch (error) {
              console.error(error);
              res.status(500).send('Error saving data to MongoDB');
          }
      });
});

router.get('/getStudents', async (req, res) => {
  try {
      // Query MongoDB to fetch student roll numbers
      const students = await student.find().select('roll_number'); // Assuming roll_number is the field name for roll numbers
      res.json(students);
  } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.get('/placement_login',async(req,res) => {
    res.render("./main/placement_login");
});

router.post('/placement_login', async (req, res) => {
  const { Username, Password } = req.body;
  const UsernameAsString = String(Username);
  const password = String(Password);
  const Roll_numberAsString = String(Username);

  try {
    if(Username=="admin" && password=="admin"){
      const token = jwt.sign({ Username: 'admin' },'keyboard', { expiresIn: '1hr' });
       return res.redirect(`./Admin/dashboard?token=${token}`);
    }
    const staff = await placement.findOne({ Username: UsernameAsString });
    console.log(staff);
    if (staff) {
      
      if (password != staff.Password) {
        console.log("Passwords do not match:", password, staff.Password);
        return res.status(400).json({ message: 'Invalid password' });
      }
      req.session.staff = staff;
      const token = jwt.sign({ id: staff._id }, 'keyboard', { expiresIn: '10m' });
      return res.redirect(`/placement/dashboard?token=${token}`);
    }

    const student = await Stu.findOne({ Roll_number: Roll_numberAsString });
    if (!student) {
      return res.status(400).json({ message: 'Invalid Roll number' });
    }

    if(password != student.Password){
      console.log("Passwords do not match:", password, student.Password);
      return res.status(400).json({ message: 'Invalid password' });
    }
    req.session.student = student;
    const token = jwt.sign({ id: student._id }, 'keyboard', { expiresIn: '10m' });
    return res.redirect(`/student/mainpage?token=${token}`);

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send('Server Error');
  }
});

function verifyToken(req, res, next) {
  const token = req.query.token;
  if (!token) {
      req.flash('error', 'Your session has expired. Please login again.');
      return res.send(`
          <html>
          <head>
              <script>
                  window.onload = function() {
                      var notification = document.createElement('div');
                      notification.id = 'sessionExpiredNotification';
                      notification.style.display = 'block';
                      notification.style.padding = '20px';
                      notification.style.backgroundColor = '#f44336';
                      notification.style.color = 'white';
                      notification.style.marginBottom = '15px';
                      notification.style.borderRadius = '3px';
                      notification.innerHTML = 'Your session has expired. Please log in again.';
                      document.body.appendChild(notification);
                      setTimeout(function() {
                          window.location.href = '/placement_login';
                      }, 3000);
                  }
              </script>
          </head>
          <body>
          </body>
          </html>
      `); // Redirect if token is not provided
  }
  jwt.verify(token, 'keyboard', (err, decoded) => {
      if (err) {
          req.flash('error', 'Your session has expired. Please login again.');
          return res.send(`
              <html>
              <head>
                  <script>
                      window.onload = function() {
                          var notification = document.createElement('div');
                          notification.id = 'sessionExpiredNotification';
                          notification.style.display = 'block';
                          notification.style.padding = '20px';
                          notification.style.backgroundColor = '#f44336';
                          notification.style.color = 'white';
                          notification.style.marginBottom = '15px';
                          notification.style.borderRadius = '3px';
                          notification.innerHTML = 'Your session has expired. Please log in again.';
                          document.body.appendChild(notification);
                          setTimeout(function() {
                              window.location.href = '/placement_login';
                          }, 3000);
                      }
                  </script>
              </head>
              <body>
              </body>
              </html>
          `); // Redirect if token verification fails
      }
      req.decoded = decoded;
      next();
  });
}


  router.get('/placement/dashboard',verifyToken, (req, res) => {
    // Parse the token from the query parameter
    const token = req.query.token;
    const x = req.session.staff;
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
            res.render('./placement/dashboard', { x,token,layout:'./layouts/placement_main' });
        }
    });
});

router.get('/placement/feedback_send', async(req,res) =>{
  const token = req.query.token;
  const x = req.session.staff;
  const data = await Stu.find();
  console.log(token);
  
  jwt.verify(token, 'keyboard', (err, decoded) => {
      if (err) {
          // Token verification failed
          res.status(401).send('Unauthorized');
      } else {
          // Render the dashboard page or perform other actions
          res.render('./placement/feedback_send', { x,token,layout:'./layouts/placement_main',data : data });
      }
  });
});

router.post('/placement/feedback_send' , async(req,res) =>{
  try {
    // Extract data from request body
    const { Roll_number,subject } = req.body;
    console.log(req.body);
    // Assuming 'Event' is your Mongoose model for events
    const Message = new message({
        Roll_number,
        subject
    });
    await Message.save();
    res.status(200).json({ message: "Form Sent Successfully" });
} catch (error) {
    // If an error occurs, respond with error message
    console.error(error);
    res.status(500).json({ error: "Failed to Send Form" });
}
});
router.get('/placement/create_students',verifyToken, async (req,res) => {
  const token = req.query.token;
    const x = req.session.staff;
    // Verify token and extract user information
    console.log(token);
    jwt.verify(token, 'keyboard', (err, decoded) => {
        if (err) {
            // Token verification failed
            res.status(401).send('Unauthorized');
        } else {
              res.render('placement/create_students', { x,token,layout:'./layouts/placement_main'}); 
        }
    });
});
router.get('/placement/eligible_students',verifyToken, async (req, res) => {
  try {
    // Fetch the event ID from the query parameters
    const eventId = req.query.id;
    const token = req.query.token;
    console.log('Received event ID:', eventId);

    if (!eventId) {
      return res.status(400).send('Event ID is required');
    }

    // Fetch the event data from the database using the event ID
    const eventData = await events.findById(eventId).lean();

    if (!eventData) {
      return res.status(404).send('Event not found');
    }

    // Extract the necessary event data for filtering
    const { Gender, CGPA, Roll_numbers, branches } = eventData;

    // Fetch all students from the database
    const allStudents = await Stu.find({}).lean();

    // Filter students based on event criteria
    const filteredStudents = allStudents.filter(student => {
      // Check if student meets gender and CGPA criteria
      if (
        (Gender === 'All' || student.Gender === Gender) &&
        parseFloat(student.CGPA) >= parseFloat(CGPA)
      ) {
        // Check if Roll_numbers is defined and includes student.Roll_number
        const isRollNumberValid = Roll_numbers && (Roll_numbers.includes(student.Roll_number) || Roll_numbers.includes("All"));

        // Check if branches is defined and includes student.Branch
        const isBranchValid = branches && (branches.includes(student.Branch) || branches.includes("All"));

        return isRollNumberValid && isBranchValid;
      }
      return false;
    });

    // Render the eligible students page with the filtered students and event data
    res.render('placement/eligible_students', { students: filteredStudents,token, eventData , layout:'./layouts/placement_main' });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Error fetching students');
  }
});
router.post('/placement/publish_event', async (req, res) => {
  try {
    const { title, start, end, Gender, CGPA, href , Roll_numbers ,branches } = req.body;

      const event = new events({
        title,
        start,
        end,
        Gender,
        CGPA,
        href,
        Roll_numbers,
        branches 
    });
      await event.save();
      res.status(200).send('Event published successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error publishing event');
  }
});



router.get('/placement/display_student',verifyToken, async (req, res) => {
  try {
    // Retrieve data from MongoDB
    const token = req.query.token;
    const data = await Stu.find();

    // Render the EJS template with the retrieved data
    res.render('placement/display_students', { token,layout:'./layouts/placement_main',data: data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/*
router.get('/placement/add_events',verifyToken, async (req,res) => {
  const token = req.query.token;
    const x = req.session.staff;
    const data = await Stu.find();
    // Verify token and extract user information
    console.log(token);
    jwt.verify(token, 'keyboard', (err, decoded) => {
        if (err) {
            // Token verification failed
            res.status(401).send('Unauthorized');
        } else {
              res.render('placement/add_events', { x,token,layout:'./layouts/placement_main',data : data}); 
        }
    });
});



router.post('/placement/add_events', async (req, res) => {
  try {
      // Extract data from request body
      const { title, start, end, Gender, CGPA, href , Roll_numbers ,branches } = req.body;
      req.session.eventData = req.body;
      const x = req.body; // Save form data in session
      res.redirect(`/eligible_students?data=${x}`);
      // Assuming 'Event' is your Mongoose model for events
      const event = new events({
          title,
          start,
          end,
          Gender,
          CGPA,
          href,
          Roll_numbers,
          branches// Assuming 'students' is a field in your Event schema to store selected students
      });
      await event.save();
      res.status(200).json({ message: "Event Saved Successfully" });
  } catch (error) {
      // If an error occurs, respond with error message
      console.error(error);
      res.status(500).json({ error: "Failed to register Event" });
  }
});
*/

router.get('/placement/add_events', verifyToken, async (req, res) => {
  const token = req.query.token;
  const x = req.session.staff;
  try {
      const data = await Stu.find();
      jwt.verify(token, 'keyboard', (err, decoded) => {
          if (err) {
              res.status(401).send('Unauthorized');
          } else {
              res.render('placement/add_events', { x, token, layout: './layouts/placement_main', data });
          }
      });
  } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).send('Error fetching students');
  }
});

router.post('/placement/add_events', async (req, res) => {
  try {

      const { title, start, end, round, CGPA, Gender, href } = req.body;
      let branches = [];
      let Roll_numbers = [];
      let eventData = {};
      // Parse branches and roll numbers based on the round
      if (round === '1' && req.body.branches) {
          try {
              branches = JSON.parse(req.body.branches);
              Roll_numbers = JSON.parse(req.body.Roll_numbers);
              eventData = { title, start, end, Gender, CGPA, href, round, branches, Roll_numbers };
          } catch (error) {
              console.error('Error parsing branches:', error);
              return res.status(400).send('Invalid branches data');
          }
      }

      if (round === '2' && req.body.Roll_numbers) {
          try {
              Roll_numbers = JSON.parse(req.body.Roll_numbers);
              branches = ['All'];
              eventData = { title, start, end, Gender : 'All', CGPA : 3.00, href, round, branches, Roll_numbers };
          } catch (error) {
              console.error('Error parsing roll numbers:', error);
              return res.status(400).send('Invalid roll numbers data');
          }
      }

      
      console.log('Final data to save:', eventData);

      // Save the event to the database
      await saveEventToDatabase(eventData);
      res.status(200).send('Event Saved Successfully');
  } catch (error) {
      console.error('Error saving event:', error);
      res.status(500).send('Failed to register event');
  }
});

async function saveEventToDatabase(eventData) {
  try {
      const event = new events(eventData);
      await event.save();
      console.log('Event saved to database:', eventData);
  } catch (err) {
      console.error('Error saving event to database:', err);
      throw err;
  }
}

function extractRollNumbers(csvData) {
  const rows = csvData.split('\n');
  const rollNumbers = [];
  let isFirstRow = true;
  rows.forEach(row => {
      if (isFirstRow) {
          isFirstRow = false;
      } else {
          const columns = row.split(',');
          if (columns.length > 0) {
              rollNumbers.push(columns[0].trim());
          }
      }
  });
  return rollNumbers;
}


router.get('/placement/display_events',verifyToken, async (req, res) => {
  try {
    // Retrieve data from MongoDB
    const token = req.query.token;
    const data = await events.find();

    // Render the EJS template with the retrieved data
    res.render('placement/display_events', { token,layout:'./layouts/placement_main',data: data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/delete_event/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await events.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/placement/eligible_list',verifyToken,async(req,res) => {
  try {
    // Retrieve data from MongoDB
    const token = req.query.token;
    const data = await events.find();

    // Render the EJS template with the retrieved data
    res.render('placement/eligible_list', { token,layout:'./layouts/placement_main',data: data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;