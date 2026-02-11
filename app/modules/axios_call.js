const axios = require('axios').default;
const crypto = require('crypto');
const axios_header = require("./axios_header_config");
const configuration = require("./configuration");
const axios_api_source = require("../config/api_source.json");

module.exports = {
    make_axios_api_source_get_province: async (method, contentType) => {
        return await axios({
            method: method,
            url: axios_api_source[0].URL_API_REGION + axios_api_source[1].GET_PROVINCE,
            headers: axios_header.getDataFiraHeader(contentType),
        })
        .then(async function (resp) {
            return resp.data;
        })
        .catch((err) => {
            return;
        });
    },
    make_axios_api_source_get_regency_without_id: async (method, contentType) => {
        return await axios({
            method: method,
            url: axios_api_source[0].URL_API_REGION + axios_api_source[2].GET_REGENCY,
            headers: axios_header.getDataFiraHeader(contentType),
        })
        .then(async function (resp) {
            return resp.data
        })
        .catch((err) => {
            return;
        });
    },
    make_axios_api_source_get_regency: async (method, sentData, contentType) => {
        return await axios({
            method: method,
            url: axios_api_source[0].URL_API_REGION + axios_api_source[2].GET_REGENCY,
            headers: axios_header.getDataFiraHeader(contentType),
            data: {
                id_province: sentData
            }
        })
        .then(async function (resp) {
            return resp.data
        })
        .catch((err) => {
            return;
        });
    },
    make_axios_api_source_get_district: async (method, sentData, contentType) => {
        return await axios({
            method: method,
            url: axios_api_source[0].URL_API_REGION + axios_api_source[3].GET_DISTRICT,
            headers: axios_header.getDataFiraHeader(contentType),
            data: {
                id_regency: sentData
            }
        })
        .then(async function (resp) {
            return resp.data
        })
        .catch((err) => {
            return;
        });
    },
    make_axios_api_source_get_village: async (method, sentData, contentType) => {
        var formData = new FormData();
        formData.append('id_district', sentData);
        return await axios({
            method: method,
            url: axios_api_source[0].URL_API_REGION + axios_api_source[4].GET_VILLAGE,
            headers: axios_header.getDataFiraHeader(contentType),
            data: formData
        })
        .then(async function (resp) {
            return resp.data;
        })
        .catch((err) => {
            return;
        });
    },
    validate_user: async (method, sentData, apiUrl, contentType, timeout) => {
        if (apiUrl == null) apiUrl = "";
        return await axios({
            method: method,
            auth: {
                username: configuration.ism_api[configuration.ism_active_env].username,
                password: configuration.ism_api[configuration.ism_active_env].password
            },
            headers: axios_header.getIsmAxiosHeader(contentType),
            url: configuration.ism_api[configuration.ism_active_env].url + apiUrl,
            data: JSON.stringify(sentData),
            timeout: timeout
        })
        .then(async function (resp) {
            return resp.data;
        })
        .catch((err) => {
            console.log(err.message);
            return err;
        });
    },
    make_axios_ism: async (method, sentData, apiUrl, contentType, timeout) => {
        if (apiUrl == null) apiUrl = "";
        return await axios({
            method: method,
            auth: {
                username: configuration.ism_api[configuration.ism_active_env].username,
                password: configuration.ism_api[configuration.ism_active_env].password
            },
            headers: axios_header.getIsmAxiosHeader(contentType),
            url: configuration.ism_api[configuration.ism_active_env].url + apiUrl,
            data: JSON.stringify(sentData),
            timeout: timeout
        })
        .then(async function (resp) {
            return resp.data;
        })
        .catch((err) => {
            console.log(err.message);
            return err;
        });
    },
    make_axios_hr_gateway: async function (method, sentData, apiUrl, contentType, timeout) {
        if (apiUrl == null) apiUrl = "";
        var user_agent = "" + configuration.IMAGE_NAME + "/" + configuration.IMAGE_VERSION;
        return await axios({
            method: method,
            headers: axios_header.getHrGatewayHeader(contentType, user_agent),
            url: configuration.hr_gateway_api[configuration.hr_gateway_active_env].url + apiUrl,
            data: JSON.stringify(sentData),
            timeout: timeout
        })
        .then(async function (resp) {
            return resp.data
        })
        .catch((err) => {
            console.log(err);
            return err;
        });
    },
    get_nonce: function () {
        let nonce = crypto.randomBytes(16).toString('hex');
        return nonce;
    },
    get_timestamp: function () {
        let timestamp = Math.floor(Date.now() / 1000);
        return timestamp;
    }
}