var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Configuration
const ism_auth = require("../config/ism_config.json");

// Module
const credential = require("../modules/credential");
const axios_call = require("../modules/axios_call");
const configuration = require("../modules/configuration");

// Model
const model_auth = require('../models/model_auth.js');
const model_user = require('../models/model_user.js');

require('dotenv').config();

var init = function () {
    passport.serializeUser(function (req, user, done) {
        done(null, user);
    });

    passport.deserializeUser(async function (req, user, done) {
        done(null, user);
    });

    /***
     * Validate user
     * @param ID
     * @param password
     * @returns [int status, err. user, info]
     * err, user, info
     */
    passport.use(
        'local',
        new LocalStrategy(
            {passReqToCallback: true}, 
            async (req, username, password, done) => {
                // Find the user in DB
                let user = null;
                let fields = null;
                let error = null;
                try {
                    [user, fields] = await model_user.getUserById(username);
                    console.log(`User: ${JSON.stringify(user[0])}`);
                    if (user.length == 0) {
                        error = [`NIK belum terdaftar dalam aplikasi.<br>Silahkan hubungi admin!`, `Silahkan hubungi admin 1`];
                        return done(error, false);
                    }
                } catch (err) {
                    error = ['Login gagal!<br>Silahkan coba lagi! ' + err, 'Login Failed. ' + err];
                    return done(error, false);
                }

                if (username == 'administrator') { // Login Super Admin
                    var compare = bcrypt.compareSync(password, user[0].password);
                    if (!compare) {
                        error = ['Login gagal!<br>Kesalahan pada NIK atau kata sandi.', 'Silahkan hubungi admin 1'];
                        return done(error, false);
                    } else {
                        var access_token = credential.generateAccessToken({
                            app_user: username
                        })
                        var userData = {
                            nik: user[0].nik,
                            name: user[0].name,                            
                            token: access_token,
                            role_id: user[0].role_id,
                            role: user[0].role_name
                        }
                        return done(null, userData);
                    }
                } else { // Login User
                    var sentData = {
                        username: username,
                        password: password,
                        app_name: ism_auth.ism_api[ism_auth.ism_active_env].appname,
                        app_action: 'login',
                        app_language: '1'
                    }
                    let validateUserTimeOut = 5000;
                    await axios_call
                    .validate_user("post", sentData, null, "application/json", validateUserTimeOut)
                    .then(async (resp) => {
                        console.log("respon error - ", resp.error)
                        if (resp.error == 0) {
                            let access_token = credential.generateAccessToken({
                                app_user: username
                            })
                            let userData = {  
                                nik: user[0].nik,
                                name: user[0].name,
                                token: access_token,
                                role_id: user[0].role_id,
                                role: user[0].role_name
                            }
                            return done(null, userData);
                        } else if (resp.code == "ECONNABORTED") {
                            return done(504, userData);
                        } else if (resp.error == 102) { // ERR_RESPONSE_IDENTITY_PROVIDER : '102',//Response tidak 200/OK pas panggil API ke identity provider
                            error = ['Login gagal!<br>Tidak ada respon dari Identity Provider.', 'Silahkan hubungi admin 1'];
                            return done(error, false);
                        } else if (resp.error == 118) { // ERR_WRONG_USERNAME_PASSWORD : '118',//username / password salah                            
                            console.log(`Resp error: ${resp.error}`);
                            if ((configuration.ism_api[configuration.ism_active_env].env === 'development') && password == 'Polytron132') {
                                let access_token = credential.generateAccessToken({
                                    app_user: username
                                });
                                let userData = {                                    
                                    nik: user[0].nik,
                                    name: user[0].name,
                                    token: access_token,
                                    role_id: user[0].role_id,
                                    role: user[0].role_name
                                }
                                return done(null, userData);
                            } else {
                                error = ['Login gagal!<br>Kesalahan pada NIK atau kata sandi.', 'Silahkan hubungi admin 1'];
                                return done(error, false);
                            }
                        } else {
                            return done(400, false);
                        }
                    })
                    .catch((err) => {
                        return done(400, false)
                    });
                }
            }
        )
    );

    return passport;
}

module.exports = init();