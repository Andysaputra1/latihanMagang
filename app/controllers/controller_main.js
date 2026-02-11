const express = require('express');
const router = express.Router();

const poly_logger = require('../modules/poly_logger');
const configuration = require('../modules/configuration');

const model_migration = require('../models/model_migration');

const c_panel = require('./panel/controller_panel');

router.get("/", async function(req, res){
    // You can redirect to the main page or any other page
    // For example, redirecting to the Polytron homepage
    res.redirect("panel/auth/login");
})

router.get('/app_status', async (req, res) => {
    var status = "";
    var db_timezone = "";
    try {
        var [data, err] = await model_migration.getDBInfo()
        if (err) {
            throw err;
        }
        status = "Connected";
        db_timezone = moment(data[0].now).format("dddd, DD-MM-YYYY (HH:mm:ss)");
    } catch (err) {
        status = "Disconnected";
        db_timezone = "-";
    };
    var title = process.env.IMAGE_PROJECT_NAME + " - App Status";
    var app_settings = {
        "app_image":                  process.env.IMAGE_NAME,
        "app_name":                   process.env.IMAGE_PROJECT_NAME,
        "app_version":                process.env.IMAGE_VERSION,
        "app_env":                    process.env.IMAGE_ENV,
        "app_port":                   process.env.IMAGE_PORT,
    };
    var db_settings = {
        "db_host":                    configuration["DB_HOST"] + ":" + configuration["DB_PORT"],
        "db_user":                    configuration["DB_USER"],
        "db_name":                    configuration["DATABASE"],
        "db_status":                  status,
        "db_timezone":                db_timezone
    };
    var response = {
        "app_settings": app_settings,
        "db_settings": db_settings
    };
    poly_logger.access_response("Access_App_Status", req, res, true, response);
    return res.render("system/app_status", {
        title: title,
        app_settings: app_settings,
        db_settings: db_settings
    });
});

router.use('/panel', c_panel);

module.exports = router;
