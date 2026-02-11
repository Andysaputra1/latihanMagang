const mysql = require('../modules/mysql_connector')
const logger = require('../modules/poly_logger')
module.exports ={
    getDBInfo: async function() {
        try {
            await mysql.connectAsync();
            let sql = "SELECT @@global.time_zone as global_tz, @@session.time_zone as session_tz, @@system_time_zone as system_tz, NOW() as now";
            let [result, cache] = await mysql.queryAsync(sql)
            await mysql.endPool()
            return [result, null]
        } catch (error) {
            console.log(error)
            logger.error("Error in 'model_migration/getDBInfo': " + error)
            await mysql.endPool()
            return [null, error]
        }
    }
}