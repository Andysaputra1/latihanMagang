const express = require('express');
const router = express.Router();
const model_employee = require('../../models/model_employee');
const model_company = require('../../models/model_company'); // Butuh ini untuk ambil nama perusahaan di judul
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//  konfigurasi Multer untuk upload gambar karyawan dengan multi-part form data. Kita simpan di folder 'public/uploads' dengan nama file unik (timestamp + nama asli)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Pastikan folder public/uploads ada
        const dir = 'public/uploads';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Format nama file: TIMESTAMP_NAMAASLI.jpg
        cb(null, Date.now() + '_' + file.originalname.replace(/\s/g, '_'));
    }
});

// Filter agar hanya bisa upload gambar
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung! Hanya jpg, jpeg, dan png.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
    fileFilter: fileFilter
});


//routes
// 1. Menampilkan Daftar Karyawan (Berdasarkan Company ID)
router.get('/', async (req, res) => {
    if (!req.user) {
        return res.redirect('/panel/auth/login');
    }
    let app_name = process.env.IMAGE_PROJECT_NAME;
    let app_version = process.env.IMAGE_VERSION;
    
    // Ambil company_id dari URL (contoh: /panel/employee?company_id=1)
    let company_id = req.query.company_id;

    // Validasi: Kalau tidak ada company_id, lempar balik ke daftar perusahaan
    if (!company_id) return res.redirect('/panel/company');

    try {
        // Ambil Data Karyawan
        var [employees, err1] = await model_employee.getEmployeeByCompany(company_id);
        
        // Ambil Data Perusahaan (untuk judul halaman)
        var [company, err2] = await model_company.getCompanyById(company_id);

        if (err1 || err2) throw err1 || err2;

        res.render("./panel/employee_list", {
            app_name: app_name,
            title: app_name + ' - Employee List',
            user: req.user, 
            sidebar: 'company',
            applicationVersion: app_version,
            version: app_version,
            encryptedUser: 'encryptedUser',
            data: employees,
            company: company // Kirim data perusahaan agar bisa tulis "Karyawan PT. X"
        });
    } catch (error) {
        console.error(error);
        res.render("system/app_status", { title: "Error", app_settings: { app_name: app_name }, db_settings: { db_status: "Disconnected", db_timezone: "-" } });
    }
});

//  API unutk detail karyawan (AJAX Split View)
router.post('/api/detail', async (req, res) => {
    try {
        let employee_id = req.body.employee_id;
        let [employee, err] = await model_employee.getEmployeeById(employee_id);
        
        if (err) return res.json({ status: "ERROR", message: err.message });
        
        
        res.json({ status: "SUCCESS", data: employee });
    } catch (error) {
        res.json({ status: "ERROR", message: "Terjadi kesalahan server" });
    }
});

//proses Tambah Karyawan plus dengan upload foto
router.post('/add', (req, res) => {
    const uploadSingle = upload.single('employee_picture');

    uploadSingle(req, res, async function (err) {
        const { company_id, employee_name, employee_gender, employee_birthday, employee_phone } = req.body;

        // validasi ada error dari Multer ( speerti : File bukan JPG/PNG atau ukuran > 2MB)
        if (err) {
            let errCode = 'upload_failed';
            if (err.message === 'LIMIT_FILE_TYPES') errCode = 'invalid_file';
            if (err.code === 'LIMIT_FILE_SIZE') errCode = 'file_too_large';

            return res.redirect(`/panel/employee?company_id=${company_id}&error=${errCode}`);
        }

        try {
            if (![1, 2].includes(req.user.role_id)) {
                return res.send("Forbidden");
            }
            
            if (!employee_name || !employee_birthday || !employee_phone) {
                return res.redirect(`/panel/employee?company_id=${company_id}&error=empty_field`);
            }
            
            // Validasi isNaN dan future_date
            if (isNaN(employee_phone)) return res.redirect(`/panel/employee?company_id=${company_id}&error=phone_nan`);

            let inputDate = new Date(employee_birthday);
            let today = new Date();
            today.setHours(0, 0, 0, 0); 

            if (inputDate > today) {
                return res.redirect(`/panel/employee?company_id=${company_id}&error=future_date`);
            }

            let picture_name = req.file ? req.file.filename : null;
            await model_employee.addEmployee({
                company_id, 
                name: employee_name, 
                gender: employee_gender, 
                birthday: employee_birthday, 
                phone: employee_phone, 
                picture: picture_name
            });

            res.redirect(`/panel/employee?company_id=${company_id}&status=add_success`);
        } catch (error) {
            res.redirect(`/panel/employee?company_id=${company_id}&error=system_error`);
        }
    });
});

// Edit Karyawan
router.post('/edit', (req, res) => {
    const uploadSingle = upload.single('employee_picture');

    uploadSingle(req, res, async function (err) {
        const { employee_id, company_id,employee_name, employee_gender, employee_birthday, employee_phone } = req.body;
        
        if (err) {
            let errCode = 'upload_failed';
                if (err.message === 'LIMIT_FILE_TYPES') errCode = 'invalid_file';
                if (err.code === 'LIMIT_FILE_SIZE') errCode = 'file_too_large';
                return res.redirect(`/panel/employee?company_id=${company_id}&error=${errCode}`);
        }

        try {
            if (![1, 2].includes(req.user.role_id)) return res.send("Forbidden");

            const { employee_id, company_id, employee_name, employee_gender, employee_birthday, employee_phone } = req.body;

            if (isNaN(employee_phone) || employee_phone === "") {
                return res.redirect(`/panel/employee?company_id=${company_id}&error=phone_nan`);
            }

            // 2. Validasi Tanggal Lahir 
            let inputDate = new Date(employee_birthday);
            let today = new Date();
            today.setHours(0, 0, 0, 0); 

            if (inputDate > today) {
                return res.redirect(`/panel/employee?company_id=${company_id}&error=future_date`);
            }

            //  Upload Foto Baru (Hapus yang lama jika ada)
            let picture_name = null;
            if (req.file) {
                picture_name = req.file.filename;
                let [oldData] = await model_employee.getEmployeeById(employee_id);
                if (oldData && oldData.employee_picture) {
                    const oldPath = path.join('public/uploads', oldData.employee_picture);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            }

            // Update Database
            const [ret, err] = await model_employee.updateEmployee(employee_id, {
                name: employee_name, gender: employee_gender, 
                birthday: employee_birthday, phone: employee_phone, picture: picture_name
            });

            if (err) throw err;
            res.redirect(`/panel/employee?company_id=${company_id}&status=edit_success`);
        } catch (error) {
            res.redirect(`/panel/employee?company_id=${company_id}&error=system_error`);
        }
    });
});


//  Hapus Karyawan
router.get('/delete/:id', async (req, res) => {
    try {
        if (![1, 2].includes(req.user.role_id)) return res.send("Forbidden");

        // Ambil data dulu untuk tahu company_id nya dan nama fotonya 
        let [emp, err1] = await model_employee.getEmployeeById(req.params.id);
        
        if (emp) {
            // Hapus file foto dari folder uploads jika ada
            if (emp.employee_picture) {
                const filePath = path.join('public/uploads', emp.employee_picture);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }

            // Hapus dari database
            await model_employee.deleteEmployee(req.params.id);
            
            // Balik ke halaman list
            res.redirect(`/panel/employee?company_id=${emp.company_id}&status=delete_success`);
        } else {
            res.redirect('/panel/company');
        }
    } catch (error) {
        res.redirect('/panel/company');
    }
});

module.exports = router;