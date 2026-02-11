const express = require('express');
const router = express.Router();
const model_user = require("../../models/model_user");
const axios_call = require("../../modules/axios_call");

router.get('/', async (req, res) => {
    let app_name = process.env.IMAGE_PROJECT_NAME;
    let app_version = process.env.IMAGE_VERSION;

    let result = {
        app_name: app_name,
        title: app_name + ' - User Management',
        user: req.user,
        sidebar: 'user',
        applicationVersion: app_version,
        version: app_version,
        encryptedUser: 'encryptedUser'
    }
    res.render("./panel/user_management", result);
});

router.post('/list_user', async (req, res) => {
    try {
        var [ret, err] = await model_user.getUser({
            start: parseInt(req.body.start),
            length: parseInt(req.body.length),
            search: req.body.search.value,
            order: req.body.columns[req.body.order[0].column].data,
            direction: req.body.order[0].dir,
            role: req.body.role
        });
    } catch (error) {
        return;
    }

    try {
        var [count, err] = await model_user.countUser({
            start: parseInt(req.body.start),
            length: parseInt(req.body.length),
            search: req.body.search.value,
            role: req.body.role
        });
    } catch (error) {
        return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
        data: ret,
        recordsTotal: (count.length>0)?count[0].total:0,
        recordsFiltered: (count.length>0)?count[0].total:0
    }));
});

router.post('/get_nik_data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (!req.body.panel_nik || req.body.panel_nik.trim().length == 0) {
        return res.status(200).json({
            status: "FAILED",
            error_code: 1,
            message: "NIK tidak boleh kosong!"
        });
    }
    var sentData = {
        nik: req.body.panel_nik
    }
    await axios_call.make_axios_hr_gateway("POST", sentData, "get_user_profile", "application/json", 5000).then(async function (resp) {
        if(resp.error==1){
            return res.status(200).send(JSON.stringify({
                status: "FAILED",
                error_code: 1,
                message: "NIK tidak ditemukan!"
            }))
        } else if (resp.code == "ECONNABORTED") {
            return res.status(200).send(JSON.stringify({
                status: "FAILED",
                error_code: 400,
                message: "Terjadi kesalahan pada server, silahkan coba beberapa saat lagi! (504 Timeout)"
            }));
        }
        return res.status(200).send(JSON.stringify({
            status: "SUCCESS",
            data: resp,
        }));
    }).catch(async function (error) {
        logger.error(error + "")
        return res.status(200).send(JSON.stringify({
            status: "FAILED",
            error_code: 400,
            message: error.code === "ECONNABORTED" ? "Terjadi kesalahan pada server, silahkan coba beberapa saat lagi! (504 Timeout)" : "Terjadi kesalahan pada server, silahkan coba beberapa saat lagi! (400 Bad Request)" 
        }));
    })
});

/***
 * Add user to DB
 */
router.post(`/add`, async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!req.body.panel_user_nik_result || !req.body.panel_user_name || !req.body.panel_user_email) {
        return res.status(200).json({
            status: "FAILED",
            error_code: 1,
            message: "NIK tidak boleh kosong!"
        });
    }
    if (!req.body.panel_user_role) {
        return res.status(200).json({
            status: "FAILED",
            error_code: 1,
            message: "Jabatan tidak boleh kosong!"
        });
    }
    try {
        var [check, err] = await model_user.checkUserExistInDb(req.body.panel_user_nik_result)
        if (check[0].total > 0) {
            return res.status(200).json({
                status: "FAILED",
                error_code: 1,
                message: "NIK sudah terdaftar!"
            });
        } else {
            var [ret, err] = await model_user.addUser({
                nik: req.body.panel_user_nik_result,
                name: req.body.panel_user_name,
                email: req.body.panel_user_email,
                creator_updater_nik: req.user.nik,
                creator_updater_name: req.user.name,
                role_id: req.body.panel_user_role
            })
            if (ret == null)
                throw err;
            return res.status(200).json({
                status: "SUCCESS",
                message: "User baru berhasil ditambahkan!"
            });
        }
    } catch (err) {
        return res.status(200).send(JSON.stringify({
            status: "FAILED",
            message: "Terjadi kesalahan pada server, silahkan coba beberapa saat lagi!"
        }));
    }
});

module.exports = router;
