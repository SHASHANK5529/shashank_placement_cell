require('dotenv').config();
const flash = require('connect-flash');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const app = express();
const PORT = 2000 || process.env.PORT;
const bodyParser = require('body-parser');
const cookieparser = require('cookie-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');

// Handle file upload route
const mongostore = require('connect-mongo');

app.use(bodyParser.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
connectDB();


app.use(session({
    secret: 'keyboard',
    resave: true,
    saveUninitialized: true,
    store : mongostore.create({
        mongoUrl: process.env.MONGODB_URI
    }), 
}))


app.use(flash());

app.use(express.static('public'));

app.use(expressLayouts);
app.set('layout','./layouts/main');
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));
app.use('/',require('./server/routes/stu'));
app.use('/',require('./server/routes/placement'));
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});