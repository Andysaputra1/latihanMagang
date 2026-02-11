const mysql = require('../modules/mysql_connector');

module.exports = {
    /***
     * Get user by NIK (id)
     */
    getUserById: async (id) => {
        let sql = 
            `SELECT nik, ms_user.name, email, password, role_id , ms_role.name as role_name 
            FROM ms_user JOIN ms_role ON ms_user.role_id = ms_role.id 
            WHERE nik = ?`;
        let result = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, error] = await mysql.executeAsync(sql, [id]);
            console.log(`Query result: ${JSON.stringify(result)}`);
        } catch (err) {
            error = err;
            console.log(`Query error: ${err}`);
        } finally {
            await mysql.endPool();
            console.log(`Query finally resut: ${result}, error: ${error}`);            
            return [result, error];
        }
    },

    getByNik: async function(username) {
        let sql = `SELECT mu.id, mu.username, mu.password, 
                    mu.role_id, mr.name AS role_name 
                    FROM ms_user mu JOIN ms_role mr ON mu.role_id = mr.id
                    WHERE mu.id = ?`;
        let result = null;
        let error = null;
        try {
            await mysql.connectAsync();
            [result, error] = await mysql.executeAsync(sql, [username]);
        } catch (err) {
            console.log(error);
            error = err;
        } finally {
            await mysql.endPool();
            return [result, error];
        }
    }
}
