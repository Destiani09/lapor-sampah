const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
const app = express();

const s3 = new S3Client({
    region: 'ap-southeast-2', 
    credentials: {
        accessKeyId: 'AKIA57OHAJA46OGI4SOP', 
        secretAccessKey: '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'
    }
});

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
    } else {
        console.log('Sudah Menyambung Ke RDS MySQL');
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'laporsampah-uts-bucket', 
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Fitur 1: READ (Tampilkan Data)
app.get('/', (req, res) => {
    // Sesuaikan nama tabel 'laporan_sampah' dan kolom 'created_at'
    const query = 'SELECT * FROM laporan_sampah ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('index', { laporan: results });
    });
});

// Fitur 2: CREATE + UPLOAD S3 (Simpan Laporan Baru)
app.post('/lapor', upload.single('foto'), (req, res) => {
    const { nama_pelapor, lokasi_sampah, deskripsi } = req.body;
    const foto_url = req.file ? req.file.location : null; 

    const query = 'INSERT INTO laporan_sampah (nama_pelapor, lokasi_sampah, deskripsi, foto_url, status) VALUES (?, ?, ?, ?, "Menunggu")';
    db.query(query, [nama_pelapor, lokasi_sampah, deskripsi, foto_url], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Fitur 3: UPDATE (Tandai Selesai)
app.get('/selesai/:id', (req, res) => {
    const id = req.params.id;
    db.query('UPDATE laporan_sampah SET status = "Selesai" WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Fitur 4: DELETE 
app.get('/hapus/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM laporan_sampah WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

const PORT = 80;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web Lapor Sampah jalan di http://54.252.236.116`);
});
