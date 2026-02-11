const express = require('express');
const app = express();
const session = require("express-session");
const path = require('path');
const configuration = require("./app/modules/configuration")
const passport = require("./app/modules/passport");
require('dotenv').config();

const c_main = require('./app/controllers/controller_main');

// Session
app.use(session({
    secret: configuration["APP_SECRET"],
    resave: false,
    unset: 'destroy',
    saveUninitialized: false, // originally true
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: false, // set to true if your site uses HTTPS
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Views Settings
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'app/views'))

// Body Parser
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
app.use(express.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname+'/public')));

// Routes
app.use('/', c_main);

// Callback Express Server
app.listen(process.env.IMAGE_PORT, () => 
    console.log(process.env.IMAGE_PROJECT_NAME + ' server running on port "' 
      + process.env.IMAGE_PORT + '" with "' + process.env.IMAGE_ENV 
      + '" environment.')
);
