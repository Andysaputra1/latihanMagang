const app_config = require('../config/app.json');
const jwt = require('jsonwebtoken');

module.exports = {
    generateKey: function(app_user) {
        return jwt.sign({"app_user":app_user}, app_config.APP_SECRET);
    },
    verifyKey: function(key) {
        try {
            var decode = jwt.verify(key, app_config.APP_SECRET);
            return decode;
        } catch(err) {
            return null;
        }
    },
    generateAccessToken: function(data) {
        return jwt.sign(data, app_config.APP_SECRET, { expiresIn: '300m' });
    }
}