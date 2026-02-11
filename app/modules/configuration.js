const fs = require("fs");
const path = require("path");
require('dotenv').config();

module.exports = function() {
        var allconfig = {};
        var file_path = path.join(__dirname, "../config");
        var list_config = fs.readdirSync(file_path);
        for (let index = 0; index < list_config.length; index++) {
            const element = list_config[index];
            const config = require("../config/"+element);
            for (const key in config) {
                if (Object.hasOwnProperty.call(config, key)) {
                    const element = config[key];
                    allconfig[key] = element;
                }
            }
        }
        var list_env = process.env;
        for (const key in list_env) {
            if (Object.hasOwnProperty.call(list_env, key)) {
                const element = list_env[key]
                allconfig[key] = element;
            }
        }
        return allconfig;
}();
