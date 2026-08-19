const db = require("./models"); // Pastikan path ke folder models sudah benar

async function runUpdateNullFiltered() {
    console.log("==========================================================");
    console.log("MEMULAI PROSES UPDATE DATA SLIK & SUMMARY -> NULL");
    console.log("Rentang Waktu: 1 Juli 2025 s/d 25 Juni 2026");
    console.log("==========================================================\n");

    try {
        // Eksekusi update dengan filter tanggal (menggunakan created_date)
        const [result, metadata] = await db.sequelize.query(`
            UPDATE mobile.data_pemohon 
            SET uri_slik = NULL, 
                uri_slik_pasangan = NULL, 
                summary_slik = NULL, 
                summary_slik_pasangan = NULL
            WHERE created_date >= '2025-07-01 00:00:00' 
              AND created_date <= '2026-06-25 23:59:59'
        `);

        // Mengambil jumlah baris yang berhasil diubah (PostgreSQL)
        const affectedRows = metadata && metadata.rowCount !== undefined ? metadata.rowCount : "Selesai";

        console.log(`[✔] Sukses mengubah data kolom menjadi NULL.`);
        console.log(`[i] Total baris yang diperbarui pada rentang waktu tersebut: ${affectedRows}`);
        
        console.log("\n==========================================================");
        console.log("PROSES UPDATE DATABASE SELESAI SUKSES!");
        console.log("==========================================================");

    } catch (error) {
        console.error("[ERROR] Terjadi kesalahan saat memperbarui database:", error);
    } finally {
        // Tutup koneksi database
        await db.sequelize.close();
        process.exit(0);
    }
}

// Jalankan fungsi
runUpdateNullFiltered();