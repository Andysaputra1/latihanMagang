const mysql = require('../modules/mysql_connector');

// 1. Ambil semua karyawan berdasarkan ID Perusahaan
const getEmployeeByCompany = async (company_id) => {
    try {
        // Kita format tanggal lahir jadi 'DD-MM-YYYY' langsung dari SQL
        // Dan kita join ke tabel company untuk dapat nama perusahaannya (opsional, buat judul)
        const query = `
            SELECT 
                emp.*, 
                DATE_FORMAT(emp.employee_birthday, '%d-%m-%Y') as formatted_birthday,
                com.company_name
            FROM ms_employee emp
            JOIN ms_company com ON emp.company_id = com.company_id
            WHERE emp.company_id = ?
            ORDER BY emp.employee_name ASC
        `;
        var [rows, fields] = await mysql.executeAsync(query, [company_id]);
        return [rows, null];
    } catch (error) {
        return [null, error];
    }
};

// 2. Ambil Detail 1 Karyawan (Untuk AJAX Profil & Edit)
const getEmployeeById = async (employee_id) => {
    try {
        // Ambil format YYYY-MM-DD juga untuk value input form edit (type="date")
        const query = `
            SELECT 
                *,
                DATE_FORMAT(employee_birthday, '%Y-%m-%d') as input_birthday_format,
                DATE_FORMAT(employee_birthday, '%d %M %Y') as view_birthday_format
            FROM ms_employee 
            WHERE employee_id = ?
        `;
        var [rows, fields] = await mysql.executeAsync(query, [employee_id]);
        return [rows[0], null];
    } catch (error) {
        return [null, error];
    }
};

// 3. Tambah Karyawan Baru
const addEmployee = async (data) => {
    try {
        const query = `
            INSERT INTO ms_employee 
            (company_id, employee_name, employee_gender, employee_birthday, employee_phone, employee_picture) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.company_id, 
            data.name, 
            data.gender, 
            data.birthday, 
            data.phone, 
            data.picture // Nama file gambar (misal: '123123.jpg')
        ];
        var [result, fields] = await mysql.executeAsync(query, params);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};

// 4. Hapus Karyawan
const deleteEmployee = async (id) => {
    try {
        const query = `DELETE FROM ms_employee WHERE employee_id = ?`;
        var [result, fields] = await mysql.executeAsync(query, [id]);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};

// 5. Update Karyawan (Nanti untuk fitur Edit)
const updateEmployee = async (id, data) => {
    try {
        // Logika dinamis: Kalau user tidak upload foto baru, jangan update kolom picture
        let query = "";
        let params = [];

        if (data.picture) {
            query = `UPDATE ms_employee SET employee_name=?, employee_gender=?, employee_birthday=?, employee_phone=?, employee_picture=? WHERE employee_id=?`;
            params = [data.name, data.gender, data.birthday, data.phone, data.picture, id];
        } else {
            query = `UPDATE ms_employee SET employee_name=?, employee_gender=?, employee_birthday=?, employee_phone=? WHERE employee_id=?`;
            params = [data.name, data.gender, data.birthday, data.phone, id];
        }

        var [result, fields] = await mysql.executeAsync(query, params);
        return [result, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    getEmployeeByCompany,
    getEmployeeById,
    addEmployee,
    deleteEmployee,
    updateEmployee
};