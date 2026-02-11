const mysql = require('../modules/mysql_connector');

const getCompany = async () => {
    try {
        const query = `SELECT * FROM ms_company ORDER BY company_name ASC`;
        var rows = await mysql.execute(query, []);
        return [rows, null];
    } catch (error) {
        return [null, error];
    }
};

const addCompany = async (data) => {
    try {
        const query = `INSERT INTO ms_company (company_name, company_phone, company_address) VALUES (?, ?, ?)`;
        const params = [data.name, data.phone, data.address];
        var result = await mysql.execute(query, params);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};

const deleteCompany = async (id) => {
    try {
        const query = `DELETE FROM ms_company WHERE company_id = ?`;
        var result = await mysql.execute(query, [id]);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    getCompany,
    addCompany,
    deleteCompany
};