const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
// const { data_pemohon } = require('./models/dataPemohon'); // sesuaikan path model
const BASE_DIR = '/opt/be/uploads/HasilSLIK';
const BASE_URL = 'http://217.196.49.162:3000/uploads/HasilSLIK';
const db = require('./models');
const DataPemohon = db.DataPemohon;

// Cek dan update berdasarkan application_id
async function prosesSatuAplikasi(application_id) {
  const appPath = path.join(BASE_DIR, application_id);

  if (!fs.existsSync(appPath)) return;

  const nikFolders = fs.readdirSync(appPath, { withFileTypes: true })
    .filter(f => f.isDirectory())
    .map(f => f.name);

  if (nikFolders.length === 0) return;

  // Ambil data_pemohon dari DB
  const pemohon = await DataPemohon.findOne({ where: { application_id } });
  if (!pemohon) return;

  const nikUtama = pemohon.nik;
  const nikPasangan = pemohon.nikpasangan; // pastikan kolom ini ada

  for (const nik of nikFolders) {
    const folderPath = path.join(appPath, nik);
    const filePath = path.join(folderPath, `${nik}.pdf`);

    if (!fs.existsSync(filePath)) continue;

    const url = `${BASE_URL}/${application_id}/${nik}/${nik}.pdf`;

    if (nik === nikUtama) {
      if (!pemohon.uri_slik) {
        await DataPemohon.update(
          { uri_slik: url },
          { where: { application_id, nik } }
        );
        console.log(`✅ uri_slik diupdate untuk ${application_id} - ${nik}`);
      }
    } else if (nik === nikPasangan) {
      if (!pemohon.uri_slik_pasangan) {
        await DataPemohon.update(
          { uri_slik_pasangan: url },
          { where: { application_id, nik: nikUtama } } // tetap update di baris nik utama
        );
        console.log(`✅ uri_pasangan diupdate untuk ${application_id} - ${nik}`);
      }
    } else {
      console.log(`⚠️  NIK ${nik} tidak cocok dengan pemohon maupun pasangan`);
    }
  }
}

// Scan semua aplikasi
function scanSemuaAplikasi() {
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`❌ Folder tidak ditemukan: ${BASE_DIR}`);
    return;
  }

  const applicationFolders = fs.readdirSync(BASE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  applicationFolders.forEach(application_id => {
    prosesSatuAplikasi(application_id);
  });
}

// Jalankan tiap detik
setInterval(scanSemuaAplikasi, 1000);
