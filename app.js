const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'db-laporsampah.ch4o40mwa55b.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'admin123',
    database: 'laporsampah',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database mati! Harap Cek Security Group RDS:', err);
        return;
    }
    console.log('Sudah Menyambung Ke RDS MYSqL');
});

// Tampilkan Halaman Utama & Daftar Laporan
app.get('/', (req, res) => {
    const query = 'SELECT * FROM laporan_sampah ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('index', { laporan: results });
    });
});

// Simpan Laporan Baru
app.post('/lapor', (req, res) => {
    const { nama_pelapor, lokasi_sampah, deskripsi } = req.body;
    const query = 'INSERT INTO laporan_sampah (nama_pelapor, lokasi_sampah, deskripsi) VALUES (?, ?, ?)';
    
    db.query(query, [nama_pelapor, lokasi_sampah, deskripsi], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

const PORT = 80;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web Lapor Sampah jalan di http://54.252.236.116`);
});