const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    let app_name = process.env.IMAGE_PROJECT_NAME;
    let app_version = process.env.IMAGE_VERSION;

    let result = {
        app_name: app_name,
        title: app_name + ' - Custom Menu',
        user: req.user,
        sidebar: 'custom_menu',
        applicationVersion: app_version,
        version: app_version,
        encryptedUser: 'encryptedUser'
    }
    res.render("./panel/custom_menu", result);
});

module.exports = router;
