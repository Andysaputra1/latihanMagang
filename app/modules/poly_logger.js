const CronJob = require('cron').CronJob
const moment = require('moment')
const onHeaders = require('on-headers')
const fs = require("fs")
const path = require("path")

function getRemoteAddress(req) {
    var ip;
    var type;
    if (req.header['x-forwarded-for']) {
        type = "HTTP_X_FORWARDED_FOR "
        ip = req.headers['x-forwarded-for']
    } else if (req.connection.remoteAddress) {
        type = "REMOTE_ADDR "
        ip = req.connection.remoteAddress
    } else {
        type = "REMOTE_ADDR "
        ip = req.hostname
    }
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1);
    return type + ip
};

function generate(req, res, time, additional, is_body=false){
    var data = {
        method: req.method,
        url: req.protocol + '://' + req.headers.host + req.originalUrl,
        httpVersion: req.httpVersion,
        remoteAddress: getRemoteAddress(req),
        responseStatusCode: res.statusCode,
        useragent: req.headers['user-agent']
    }

    if(time){
        data["responseTime"] = time.toFixed(3)
    }

    if(additional){
        for (var key in additional) {
            data[key] = additional[key]
        }
    }

    if(is_body){
        data["body"] = req.method=="GET"?req.query:req.body
    }
    

    return data
}

function write_log(type, log_data, file_name){
    log_data = log_data + "\n"
    var datenow = moment().format("YYYY_MM_DD")
    var yearmonth = moment().format("YYYY_MM")
    var log = moment().format("HH:mm:ss") + "|" + log_data
    var logFolder = path.join(process.cwd(), "logs/"+type+"/"+yearmonth)

    if (!fs.existsSync(logFolder)) {
        const path = logFolder + "/"
        fs.mkdirSync(path, {recursive: true})
    }

    var file_path = logFolder+"/"+ (file_name?file_name+"_":"") + datenow + ".txt"
    if (!fs.existsSync(file_path)) {
        fs.writeFileSync(file_path, log, { flag: 'w', mode: "0777" })
    } else {
        fs.writeFileSync(file_path, log, { flag: 'a', mode: "0777" })
    }
}

var deleteFolderRecursive = function (path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function log_rotate(){
    const job = new CronJob('0 0 0 1 * *', async function() {
        var folderType = [
            path.join(process.cwd(), "logs/access/"),
            path.join(process.cwd(), "logs/error/"),
            path.join(process.cwd(), "logs/debug/")
        ]
        var now = moment()
        for (let index = 0; index < folderType.length; index++) {
            const folder = folderType[index];
            if(fs.existsSync(folder)){
                var listFolder = fs.readdirSync(folder)
                for (var fldr of listFolder){
                    var zipper = require('jszip')()
                    var folderInfo = fs.statSync(folder+fldr)
                     if(folderInfo.isDirectory()){
                        var listLog = fs.readdirSync(folder+fldr)
                        listLog.forEach(log => { 
                            var fileInfo = fs.statSync(folder+fldr+"/"+log)
                            if(Math.ceil(now.diff(moment(fileInfo.mtime),"months",true))>=3){
                                zipper.file(log,fs.readFileSync(folder+fldr+"/"+log));
                                fs.unlinkSync(folder+fldr+"/"+log)
                            }
                        })
                       
                        if(Math.ceil(now.diff(moment(folderInfo.mtime),"months",true))>=3){
                            fs.rmdirSync(folder+fldr)
                        }
                    }else{
                        if(Math.ceil(now.diff(moment(folderInfo.mtime),"months",true))>=3){
                            zipper.file(log,fs.readFileSync(folder+fldr+"/"+log));
                            fs.unlinkSync(folder+fldr)
                        }
                    }
                    var splitFolderName = folder.split('/')
                    getFolderName = ''
                    getFolderName = splitFolderName[splitFolderName.length-2]
                    var numberOfEntries = Object.keys(zipper.files).length;
                    if(numberOfEntries>0)
                    {
                        zipper
                            .generateNodeStream({type: 'nodebuffer', streamFiles: true, compression: "DEFLATE", compressionOptions: {
                                level: 7
                            } })
                            .pipe(fs.createWriteStream(folder+fldr+'_'+getFolderName+'.zip'))
                            .on('finish', function () {
                                console.log("Success to write file "+ folder+fldr+'_'+getFolderName+'.zip')
                            });
                    }
                }
               
            }
        }
    });
    job.start();
}

module.exports = {
    /**
     * Middleware function for log all access url with or without body
     * @param {Object} app 
     * @param {String} file_name 
     * @param {Boolean} is_body 
     */
    access: function(app, file_name="access", is_body=false) {
        app.use(function(req, res, next){
            var startAt = process.hrtime()
            onHeaders(res, () => {
                var diff = process.hrtime(startAt)
                var time = diff[0] * 1e3 + diff[1] * 1e-6
                write_log("access", JSON.stringify(generate(req, res, time, null, is_body)), file_name)
            })
            if(next)
                next()
        })
    },
    /**
     * Function for write log acces with additional data response
     * @param {String} file_name 
     * @param {Object} req 
     * @param {Object} res 
     * @param {Boolean} is_body 
     * @param {Object} additional 
     */
    access_response: function(file_name="access", req, res, is_body, response){
        write_log("access", JSON.stringify(generate(req, res, 0, {response: response}, is_body)), file_name)
    },
    /**
     * Function for init logrotate
     */
    init: function(){
        log_rotate()
    },
    /**
     * Function to write log error
     * @param {Object | String} data value of variable can be string or object
     */
    error: function(data){
        var fileLines = (new Error().stack.split("at ")[2]).trim()
        if(!(data instanceof String))
            data = JSON.stringify(data)
        write_log("error", fileLines+" "+data)
    },
    /**
     * Function to write log debug
     * @param {Object | String} data value of variable can be string or object
     */
    debug: function(data){
        var fileLines = (new Error().stack.split("at ")[2]).trim()
        if(!(data instanceof String))
            data = JSON.stringify(data)
        write_log("debug", fileLines+" "+data)
    },
    /**
     * Function for get all file log created
     * @returns List of object each folder
     */
    list_all: function(){
        var folderType = [
            "access",
            "error",
            "debug"
        ]
        var list_log_file = {}
        for (let index = 0; index < folderType.length; index++) {
            const fType = folderType[index];
            list_log_file[fType] = []
            var folderPath = "logs/"+fType+"/"
            var folder = path.join(process.cwd(), folderPath)
            if(fs.existsSync(folder)){
                var listFolder = fs.readdirSync(folder)
                listFolder.forEach(fldr => {
                    var folderInfo = fs.statSync(folder+fldr)
                    if(folderInfo.isDirectory()){
                        var listLog = fs.readdirSync(folder+fldr)
                        listLog.forEach(log => {
                            list_log_file[fType].push("/"+folderPath+fldr+"/"+log)
                        })
                    }else{
                        list_log_file[fType].push("/"+folderPath+fldr)
                    }
                })
            }
        }
        return list_log_file
    },
    list_all_zipped: function(){
        var list_log_file = []
        var folderPath = "logs/"
        var folder = path.join(process.cwd(), folderPath)
        if(fs.existsSync(folder)){
            var listFolder = fs.readdirSync(folder)
            
            listFolder.forEach(fldr => {
                var folderInfo = fs.statSync(folder+fldr)
                if(!folderInfo.isDirectory()){
                    list_log_file.push("/"+folderPath+fldr)
                }
            })
        }
        return list_log_file
    }
}