const mysql = require('../modules/mysql_connector')

module.exports = {
    /***
     * Get All User from DB
     * @returns
     */
    getUser: async (data) => {
        let sql =
            `SELECT nik, ms_user.name, role_id, ms_role.name as role 
            FROM ms_user JOIN ms_role ON ms_user.role_id = ms_role.id 
            WHERE role_id != 1 
            ORDER BY role_id, nik;`;
        let result = null;
        let fields = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, fields] = await mysql.executeAsync(sql, [`%${data.search}%`, `%${data.search}%`, `%${data.search}%`]);
        } catch (err) {
            error = err;
        } finally {
            await mysql.endPool();
            return [result, error];
        }
    },
    countUser: async (data) => {
        let sql = 
        `SELECT COUNT(*) AS total 
        FROM ms_user mu 
        JOIN ms_role mr ON mu.role_id = mr.id 
        WHERE mu.role_id != 1 
        AND (mu.nik LIKE ? OR mu.name LIKE ? OR mr.name LIKE ?)`;
        let result = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, error] = await mysql.executeAsync(sql, [`%${data.search}%`, `%${data.search}%`, `%${data.search}%`]);
            console.log(`countUser: ${result.length}`);
        } catch (err) {
            error = err;
            console.log(`countUser error: ${error}`);
        } finally {
            await mysql.endPool();
            return [result, error];
        }
    },

    /***
     * Check if user already exist in DB
     * @param NIK
     * @returns 
    */
    checkUserExistInDb: async (nik) => {
        let result = null;
        let fields = null;
        let error = null;
        let sql = `SELECT COUNT(*) AS total FROM ms_user WHERE nik = ?`;
        try {
            await mysql.connectAsync();
            [result, fields] = await mysql.executeAsync(sql, [nik]);
        } catch (err) {
            error = err;            
        } finally {
            await mysql.endPool();
            return [result, error];
        }
    },

    addUser: async (data) => {
        console.log(`addUser:\n${JSON.stringify(data)}`);
        let sql = `INSERT INTO ms_user (nik, name, email, password, created_by_nik, created_by_name, updated_by, role_id) VALUES (?, ?, ?, '0', ?, ?, ?, ?)`;
        let result = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, error] = await mysql.executeAsync(sql, [data.nik, data.name, data.email, data.creator_updater_nik, data.creator_updater_name, data.creator_updater_nik, data.role_id]);
        } catch (err) {
            error = err;
            console.log(`addUser error: ${error}`);
        } finally {
            await mysql.endPool();
            return [result, error];
        }
    },

    editUser: async function(data) {
        let sql = `UPDATE ms_user SET role_id = ?, updated_by = ? WHERE id = ? `;
        let result = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, error] = await mysql.executeAsync(sql, [data.role, data.createdOrUpdatedBy, data.nik]);
        } catch (err) {
            error = err;
        } finally {
            await mysql.endPool();
            return [result, error];
        }
    },

    deleteUser: async function(data) {
        let sql = `DELETE FROM ms_user WHERE id = ? `;
        let result = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, error] = await mysql.executeAsync(sql, [data.nik]);       
        } catch (err) {
            error = err;
        } finally {
            await mysql.endPool();
            return [result, null];
        }
    },

    getUserById: async (id) => {
        let sql = 
            `SELECT nik, ms_user.name, email, password, role_id , ms_role.name as role_name 
            FROM ms_user JOIN ms_role ON ms_user.role_id = ms_role.id 
            WHERE nik = ?`;
        let result = null;
        let fields = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, fields] = await mysql.executeAsync(sql, [id]);
        } catch (err) {
            error = err;
        } finally {
            await mysql.endPool();
            return [result, error];
        }
    }
}