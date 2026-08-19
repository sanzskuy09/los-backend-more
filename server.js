const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path"); // TAMBAHAN: Untuk mengelola path folder
// const archiver = require("archiver"); // TAMBAHAN: Untuk ZIP file
const archiver = require("archiver");
const cron = require("node-cron");

const app = express();
const port = 3000;
const db = require("./models");
const dataPemohonRoutes = require("./routes/dataPemohon");
const dataUserRoutes = require("./routes/dataUser");
const dataDealerRoutes = require("./routes/dataDealer");
const dokumenDealerRoutes = require("./routes/dokumenDealer");
const cors = require("cors");

// Load SSL certificate and key
// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/api1.cf.gratama-finance.co.id/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/api1.cf.gratama-finance.co.id/fullchain.pem")
// };

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/pemohon", dataPemohonRoutes);
app.use("/api/user", dataUserRoutes);
app.use("/api/dealer", dataDealerRoutes);
app.use("/api/dokumen-dealer", dokumenDealerRoutes);

// Database sync and start HTTPS server
// db.sequelize.sync().then(() => {
//   https.createServer(options, app).listen(port, () => {
//     console.log(`HTTPS Server running on https://localhost:${port}`);
//   });
// });

// ==========================================
// ====== TAMBAHAN SERVICE BACKUP ===========
// ==========================================
const UPLOADS_BASE_DIR = path.join(__dirname, 'uploads'); 
const SECRET_TOKEN = 'super-secret-token-2026';

function getLocalFilePath(dbValue) {
    if (!dbValue) return null;
    let relativePath = dbValue;
    if (dbValue.includes('/uploads/')) {
        relativePath = dbValue.split('/uploads/')[1];
    }
    const fullPath = path.join(UPLOADS_BASE_DIR, relativePath);
    return fs.existsSync(fullPath) ? fullPath : null;
}

// Rute baru untuk mendownload backup
app.get("/api/backup/download", async (req, res) => {
    // 1. Validasi Token
    if (req.query.token !== SECRET_TOKEN) {
        return res.status(403).send("Akses Ditolak: Token tidak valid.");
    }

    try {
        // 2. Eksekusi query menggunakan Sequelize (raw query)
        const [rows] = await db.sequelize.query(`
            SELECT nik, nama, fotoktp, fotoktppasangan, application_id, 
                   uri_slik, uri_slik_pasangan, uri_pefindo, uri_pefindo_pasangan 
            FROM mobile.data_pemohon
        `);

        if (rows.length === 0) {
            return res.status(404).send("Tidak ada data pemohon untuk dibackup.");
        }

        // 3. Set Header Response untuk Download ZIP
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        res.attachment(`backup-pemohon-${timestamp}.zip`);
        
        // --- KODE YANG BARU ---
        // Panggil class ZipArchive secara langsung
        const archive = new archiver.ZipArchive({ zlib: { level: 9 } });
        archive.on("error", (err) => { throw err; });
        archive.pipe(res);
        // ----------------------

        // 4. Proses dan Susun Folder
        for (const row of rows) {
            const nik = row.nik || "TANPA_NIK";
            const namaClean = (row.nama || "TANPA_NAMA").replace(/[/\\?%*:|"<>\s]/g, "_");
            const appId = row.application_id || "TANPA_APP_ID";
            const baseFolder = `${nik}_${namaClean}/${appId}`;

            const fileTargets = [
                { dbVal: row.fotoktp, folder: "ktp" },
                { dbVal: row.fotoktppasangan, folder: "ktp" },
                { dbVal: row.uri_slik, folder: "slik" },
                { dbVal: row.uri_slik_pasangan, folder: "slik" },
                { dbVal: row.uri_pefindo, folder: "pefindo" },
                { dbVal: row.uri_pefindo_pasangan, folder: "pefindo" }
            ];

            for (const target of fileTargets) {
                const localPath = getLocalFilePath(target.dbVal);
                if (localPath) {
                    archive.file(localPath, { name: `${baseFolder}/${target.folder}/${path.basename(localPath)}` });
                }
            }
        }

        // 5. Finalisasi Pembuatan ZIP
        await archive.finalize();

    } catch (error) {
        console.error("Error saat melakukan backup:", error);
        if (!res.headersSent) {
            res.status(500).send("Terjadi kesalahan internal pada server saat memproses backup.");
        }
    }
});

// Fungsi BARU untuk menentukan path/struktur folder di dalam ZIP
// Ini akan mendeteksi apakah file berada di root uploads atau di dalam HasilSLIK
function getZipEntryPath(dbValue) {
    if (!dbValue) return null;
    
    // Jika di DB berupa URL/Path penuh, ambil bagian setelah 'uploads/'
    let relativePath = dbValue;
    if (dbValue.includes('/uploads/')) {
        relativePath = dbValue.split('/uploads/')[1];
    }
    
    // Gabungkan dengan folder 'uploads' sebagai root di dalam ZIP Anda
    // Hasilnya akan otomatis menjadi:
    // - uploads/nama_foto_ktp.jpg (untuk KTP)
    // - uploads/HasilSLIK/PKB-xxxx/2101xxx/file.pdf (untuk SLIK)
    return path.join('uploads', relativePath).replace(/\\/g, '/'); // Force gunakan slash '/' untuk ZIP
}

// Rute untuk mendownload HARIAN dengan struktur folder baru
app.get("/api/backup/download-daily", async (req, res) => {
    if (req.query.token !== SECRET_TOKEN) {
        return res.status(403).send("Akses Ditolak: Token tidak valid.");
    }

    const targetDate = req.query.date || new Date().toISOString().split("T")[0];

    try {
        const [rows] = await db.sequelize.query(`
            SELECT nik, nama, fotoktp, fotoktppasangan, application_id, 
                   uri_slik, uri_slik_pasangan, uri_pefindo, uri_pefindo_pasangan 
            FROM mobile.data_pemohon
            WHERE DATE(created_date) = :targetDate
        `, {
            replacements: { targetDate: targetDate }
        });

        if (rows.length === 0) {
            return res.status(404).send(`Tidak ada data pemohon untuk tanggal ${targetDate}.`);
        }

        res.attachment(`backup-pemohon-harian-${targetDate}.zip`);
        
        // Menggunakan constructor yang berhasil di server Anda
        const archive = new archiver.ZipArchive({ zlib: { level: 9 } });
        archive.on("error", (err) => { throw err; });
        archive.pipe(res);

        for (const row of rows) {
            // Kumpulkan semua value kolom file dari database
            const fileTargets = [
                row.fotoktp,
                row.fotoktppasangan,
                row.uri_slik,
                row.uri_slik_pasangan,
                row.uri_pefindo,
                row.uri_pefindo_pasangan
            ];

            for (const dbVal of fileTargets) {
                if (dbVal) {
                    const localPath = getLocalFilePath(dbVal); // Cek file fisik di server
                    const zipPath = getZipEntryPath(dbVal);   // Dapatkan path tujuan di dalam ZIP

                    if (localPath && zipPath) {
                        archive.file(localPath, { name: zipPath });
                    }
                }
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error("Error saat melakukan backup harian:", error);
        if (!res.headersSent) {
            res.status(500).send("Terjadi kesalahan internal pada server saat memproses backup harian.");
        }
    }
});

// ==========================================
// ====== OTOMATISASI BACKUP HARIAN =========
// ==========================================
// Buat folder 'backups' di dalam project Anda jika belum ada
// const BACKUP_DESTINATION = path.join(__dirname, 'backups');
// if (!fs.existsSync(BACKUP_DESTINATION)) {
//     fs.mkdirSync(BACKUP_DESTINATION);
// }

// // Jadwal Cron: Berjalan setiap hari pada jam 23:59 malam
// cron.schedule("59 23 * * *", async () => {
//     const tanggalHariIni = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
//     console.log(`[CRON] Memulai proses backup otomatis untuk tanggal: ${tanggalHariIni}`);
    
//     const namaFileZip = `backup-harian-${tanggalHariIni}.zip`;
//     const pathSimpanZip = path.join(BACKUP_DESTINATION, namaFileZip);

//     try {
//         // Ambil data HANYA yang dibuat pada hari ini
//         const [rows] = await db.sequelize.query(`
//             SELECT nik, nama, fotoktp, fotoktppasangan, application_id, 
//                    uri_slik, uri_slik_pasangan, uri_pefindo, uri_pefindo_pasangan 
//             FROM mobile.data_pemohon
//             WHERE DATE(created_date) = CURRENT_DATE
//         `);

//         if (rows.length === 0) {
//             console.log(`[CRON] Tidak ada data pemohon baru hari ini (${tanggalHariIni}). Backup dilewati.`);
//             return;
//         }

//         // Siapkan write stream untuk menyimpan file fisik ke server
//         const outputStream = fs.createWriteStream(pathSimpanZip);
//         const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

//         // Event listener jika proses simpan selesai
//         outputStream.on("close", () => {
//             console.log(`[CRON] Backup otomatis berhasil disimpan: ${namaFileZip} (${archive.pointer()} total bytes)`);
//         });

//         archive.on("error", (err) => { throw err; });
        
//         // Pipa (pipe) hasil zip ke file sistem, bukan ke response HTTP
//         archive.pipe(outputStream);

//         // Proses dan Susun Folder (Sama seperti service API)
//         for (const row of rows) {
//             const nik = row.nik || "TANPA_NIK";
//             const namaClean = (row.nama || "TANPA_NAMA").replace(/[/\\?%*:|"<>\s]/g, "_");
//             const appId = row.application_id || "TANPA_APP_ID";
//             const baseFolder = `${nik}_${namaClean}/${appId}`;

//             const fileTargets = [
//                 { dbVal: row.fotoktp, folder: "ktp" },
//                 { dbVal: row.fotoktppasangan, folder: "ktp" },
//                 { dbVal: row.uri_slik, folder: "slik" },
//                 { dbVal: row.uri_slik_pasangan, folder: "slik" },
//                 { dbVal: row.uri_pefindo, folder: "pefindo" },
//                 { dbVal: row.uri_pefindo_pasangan, folder: "pefindo" }
//             ];

//             for (const target of fileTargets) {
//                 const localPath = getLocalFilePath(target.dbVal);
//                 if (localPath) {
//                     archive.file(localPath, { name: `${baseFolder}/${target.folder}/${path.basename(localPath)}` });
//                 }
//             }
//         }

//         // Finalisasi ZIP
//         await archive.finalize();

//     } catch (error) {
//         console.error(`[CRON ERROR] Gagal melakukan backup harian:`, error);
//     }
// });
// ==========================================
// ==========================================

db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Node.js running on http://localhost:${port}`);
    // console.log(`\n=> LINK BACKUP: http://localhost:${port}/api/backup/download?token=${SECRET_TOKEN}`);
  });
});
