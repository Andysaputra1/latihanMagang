const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    let greeting = 'Selamat malam';
    let hour = new Date().getHours();
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // eg. 'America/Chicago' or 'Asia/Jakarta'

    if (timeZone == 'UTC') hour +=7;
        
    if (hour >= 4 && hour < 10) greeting = 'Selamat pagi';
    else if (hour >= 10 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = "Selamat sore";
    
    let app_name = process.env.IMAGE_PROJECT_NAME;
    let app_version = process.env.IMAGE_VERSION;

    let result = {
        app_name: app_name,
        title: app_name + ' - Log Management',
        user: req.user,
        sidebar: 'log',
        applicationVersion: app_version,
        version: app_version,
        encryptedUser: 'encryptedUser'
    }
    res.render("./panel/log", result);
});

module.exports = router;
