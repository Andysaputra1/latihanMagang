const express = require('express');
const router = express.Router();
const model_company = require("../../models/model_company");

router.get('/', async (req, res) => {
    let app_name = process.env.IMAGE_PROJECT_NAME;
    let app_version = process.env.IMAGE_VERSION;

    try {
        var [data, err] = await model_company.getCompany();
        if (err) throw err;

        let result = {
            app_name: app_name,
            title: app_name + ' - Company List',
            user: req.user, 
            sidebar: 'company', 
            applicationVersion: app_version,
            version: app_version,
            encryptedUser: 'encryptedUser',
            data: data 
        }
        res.render("./panel/company_list", result);
    } catch (error) {
        console.error("Error loading company list:", error);

        // Menggunakan view system jika terjadi error database
        res.render("system/app_status", {
            title: "Error",
            app_settings: { app_name: app_name },
            db_settings: { db_status: "Disconnected", db_timezone: "-" }
        });
    }
});

router.post('/add', async (req, res) => {
    try {
        // Proteksi Role: Hanya Admin (Role 2 dan 1)
        if (req.user.role_id != 2 || req.user.role_id != 1) {
            return res.status(200).json({ status: "FAILED", message: "Akses ditolak!" });
        }

        const { company_name, company_phone, company_address } = req.body;
        const [ret, err] = await model_company.addCompany({
            name: company_name,
            phone: company_phone,
            address: company_address
        });
        if (err) throw err;

        res.redirect('/panel/company');
    } catch (error) {
        res.redirect('/panel/company?error=1');
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        if (req.user.role_id != 2 ||  req.user.role_id != 1) return res.status(403).send("Forbidden");
        
        const [ret, err] = await model_company.deleteCompany(req.params.id);
        if (err) {
            // Jika gagal hapus karena masih ada karyawan (FK Constraint)
            return res.send("<script>alert('Gagal hapus: Perusahaan masih memiliki karyawan'); window.location='/panel/company';</script>");
        }
        res.redirect('/panel/company');
    } catch (error) {
        res.redirect('/panel/company');
    }
});

module.exports = router;