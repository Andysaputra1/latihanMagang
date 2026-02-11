const express = require('express');
const router = express.Router();
const passport = require('passport');

const c_dashboard = require('./controller_dashboard');
const c_user_management = require('./controller_user_management');
const c_custom_menu = require('./controller_custom_menu');
const c_log_management = require('./controller_log_management');

/***
 * Controller for display login view
 */
router.get('/auth/login', async (req, res) => {
    let app_name = process.env.IMAGE_PROJECT_NAME;
    let app_version = process.env.IMAGE_VERSION;

    let result = {
        app_name: app_name,
        title: app_name + ' - Login',
        app_name: app_name.toUpperCase(),
        app_version: app_version,
    }
    res.render("./panel/login", result);
});

/***
 * Controller for login verification and validation process
 */
router.post('/auth/login/submit', async (req, res, next) => {
	var username = req.body.username
	var password = req.body.password
	try {
        if (!username) {
            return res.status(200).json({
                status: "FAILED",
                error_code: 1,
                message: ["NIK tidak boleh kosong!", null]
            });
        }
        if (!password) {
            return res.status(200).json({
                status: "FAILED",
                error_code: 1,
                message: ["Kata sandi tidak boleh kosong!", null]
            });
        }

        passport.authenticate('local', async (err, user, info) => {
            console.log(`Authenticate result
                        err: ${err}
                        user: ${JSON.stringify(user)}
                        info: ${info}`);
            if (err || !user) {
                if (info) {
                    return res.status(200).json({
                        status: "FAILED",
                        error_code: 3,
                        message: ['Login gagal!<br>Silahkan coba lagi!', 'Silahkan hubungi admin 1']
                    });
                }

                if (err == 504) {
                    return res.status(200).json({
                        status: "FAILED",
                        error_code: 3,
                        message: ["Login gagal! Tidak ada respon dari server (504 Timeout)", "Silahkan hubungi admin 1"]
                    });
                } else if (err == 400) {
                    return res.status(200).json({
                        status: "FAILED",
                        error_code: 3,
                        message: ["Login gagal! Terjadi kesalahan pada server (400 Bad Request)", 'Silahkan hubungi admin 1']
                    });
                }

                return res.status(200).json({
                    status: "FAILED",
                    error_code: 3,
                    message: err//"NIK atau Password salah, atau NIK belum terdaftar!"
                });
            }

            req.login(user, async function (err) {
                console.log(`req login err: ${err}`);
                if (!err) {
                    console.log(`Sukses`);
                    return res.status(200).json({
                        status: "SUCCESS",
                        error_code: 200,
                        message: "Berhasil masuk!",
                        user_role: user.role
                    });
                }
                if (err) {
                    console.log(`Gagal`);
                    return res.status(200).json({
                        status: "FAILED",
                        error_code: 3,
                        message: err//"NIK atau Password salah, atau NIK belum terdaftar!"
                    });
                }
                return;
            })
        })
        (req, res, next);
    } catch (error) {
        logger.error(error)
        return res.status(200).json({
            status: "FAILED",
            error_code: 4,
            message: "Internal Server Error"
        });
    }
});

/***
 * Controller for logout from panel
 */
router.get('/auth/logout', async (req, res) => {
    req.session.destroy(async function (err) {
        req.logout(function (err) {
            if (err) {
              return err;
            }
        });      
        res.redirect('/panel/auth/login');
    });
});

router.use('/dashboard', c_dashboard);
router.use('/user', c_user_management);
router.use('/user_management', c_user_management);
router.use('/custom', c_custom_menu);
router.use('/custom_menu', c_custom_menu);
router.use('/log', c_log_management);
router.use('/log_management', c_log_management);

module.exports = router;
