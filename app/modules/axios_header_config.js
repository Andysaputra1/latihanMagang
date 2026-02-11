require('dotenv').config();

function returnDataFiraHeader(content) {
    const headers = {
        'Content-Type': content,
        'Authorization': 'Basic YWRtaW46PTQ1NDY4NjQwOA=='
    }
    return headers;
}

function returnIsmHeader(content) {
    const headers = {
        'Content-Type': content,
        'Authorization': 'Basic aW5zZW50aWY6SW5zZW50aWYxMzI='
    }
    return headers;
}

function returnHrGatewayHeader(content, user_agent) {
    const headers = {
        'Content-Type': content,
        'Authorization': 'Bearer ' + 'bZgAsHXdZPu4PPEkAQAEkaE6pZjBtDasdasdmqwi219nnadsux5a5nTBF9FxYE4ZUpQFAjmKkGsUjt',
        'User-Agent': user_agent
    }
    return headers;
}

module.exports = {
    getDataFiraHeader: function (content) {
        var response = returnDataFiraHeader(content)
        return response;
    },
    getIsmAxiosHeader: function (content) {
        var response = returnIsmHeader(content);
        return response;
    },
    getHrGatewayHeader: function (content, user_agent) {
        var response = returnHrGatewayHeader(content, user_agent)
        return response;
    },
}
