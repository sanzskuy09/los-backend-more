const fs = require("fs");
const path = require("path");
const db = require("./models"); // Pastikan path ke folder models sudah benar

const UPLOADS_BASE_DIR = path.join(__dirname, 'uploads');

function getLocalFilePath(dbValue) {
    if (!dbValue) return null;
    let relativePath = dbValue;
    if (dbValue.includes('/uploads/')) {
        relativePath = dbValue.split('/uploads/')[1];
    }
    return path.join(UPLOADS_BASE_DIR, relativePath);
}

async function runCleanup() {
    console.log("==========================================================");
    console.log("MEMBERSIHKAN DATA SLIK & PEFINDO (KHUSUS APPROVE / REJECT)");
    console.log("==========================================================\n");

    try {
        // Query dengan filter ketat: hanya mengambil status yang true
        const [rows] = await db.sequelize.query(`
            SELECT a.is_final_approve, a.is_final_reject, dp.application_id, 
                   dp.uri_slik, dp.uri_slik_pasangan, dp.uri_pefindo, dp.uri_pefindo_pasangan
            FROM mobile.data_pemohon dp
            JOIN mobile.approval a ON a.application_id = dp.application_id 
            WHERE a.is_final_approve = true OR a.is_final_reject = true
        `);

        if (rows.length === 0) {
            console.log("[INFO] Tidak ada data pemohon dengan status Final Approve atau Final Reject.");
            console.log("Proses cleanup dibatalkan otomatis. Tidak ada file yang dihapus.");
            process.exit(0);
        }

        console.log(`[INFO] Ditemukan ${rows.length} data pemohon yang berstatus FINAL.\n`);

        for (const row of rows) {
            const appId = row.application_id;
            
            // Menentukan teks status untuk kebutuhan log di terminal
            let statusTeks = "UNKNOWN";
            if (row.is_final_approve === true || row.is_final_approve === 1 || row.is_final_approve === "true") {
                statusTeks = "FINAL APPROVE";
            } else if (row.is_final_reject === true || row.is_final_reject === 1 || row.is_final_reject === "true") {
                statusTeks = "FINAL REJECT";
            }

            const fileTargets = [
                row.uri_slik, 
                row.uri_slik_pasangan, 
                row.uri_pefindo, 
                row.uri_pefindo_pasangan
            ];

            let fileTerhapus = 0;

            // Proses hapus file fisik
            for (const dbVal of fileTargets) {
                if (dbVal) {
                    const localPath = getLocalFilePath(dbVal);
                    if (localPath && fs.existsSync(localPath)) {
                        fs.unlinkSync(localPath);
                        fileTerhapus++;
                    }
                }
            }

            // Update database menjadi NULL
            await db.sequelize.query(`
                UPDATE mobile.data_pemohon 
                SET uri_slik = NULL, 
                    uri_slik_pasangan = NULL, 
                    uri_pefindo = NULL, 
                    uri_pefindo_pasangan = NULL
                WHERE application_id = '${appId}'
            `);

            // Log ini akan memperlihatkan status final dari data yang diproses
            console.log(`[✔] App ID: ${appId} | Status: [${statusTeks}] | File Dihapus: ${fileTerhapus} | DB -> NULL`);
        }

        console.log("\n==========================================================");
        console.log("PROSES CLEANUP SELESAI!");
        console.log("==========================================================");

    } catch (error) {
        console.error("[ERROR] Terjadi kesalahan saat menjalankan cleanup:", error);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

runCleanup();