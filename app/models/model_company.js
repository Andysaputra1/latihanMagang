const mysql = require('../modules/mysql_connector');

const getCompany = async () => {
    try {
        const query = `SELECT * FROM ms_company ORDER BY company_name ASC`;
        var rows = await mysql.executeAsync(query, []);
        return [rows, null];
    } catch (error) {
        return [null, error];
    }
};

// Ambil 1 data company untuk form Edit
const getCompanyById = async (id) => {
    try {
        const query = `SELECT * FROM ms_company WHERE company_id = ?`;
        var rows = await mysql.executeAsync(query, [id]);
        return [rows[0], null];
    } catch (error) {
        return [null, error];
    }
};

const addCompany = async (data) => {
    try {
        const query = `INSERT INTO ms_company (company_name, company_phone, company_address) VALUES (?, ?, ?)`;
        const params = [data.name, data.phone, data.address];
        var result = await mysql.executeAsync(query, params);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};

const updateCompany = async (id, data) => {
    try {
        const query = `UPDATE ms_company SET company_name = ?, company_phone = ?, company_address = ? WHERE company_id = ?`;
        var result = await mysql.executeAsync(query, [data.name, data.phone, data.address, id]);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};


const deleteCompany = async (id) => {
    try {
        const query = `DELETE FROM ms_company WHERE company_id = ?`;
        var result = await mysql.executeAsync(query, [id]);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    getCompany,
    addCompany,
    deleteCompany,
    getCompanyById,
    updateCompany
};