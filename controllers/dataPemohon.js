const { DataPemohon,DataUser,  data_cabang } = require("../models");
const path = require("path");
const fs = require("fs");
// const path = require('path');
const { Sequelize } = require("sequelize");
const { sequelize } = require("../models"); // pastikan import sequelize instance


exports.create = async (req, res) => {
  try {
    let {
      cabang,
      statusperkawinan,
      nik,
      nama,
      tempatlahir,
      tgllahir,
      alamat,
      rt,
      rw,
      kel,
      kec,
      kota,
      provinsi,
      dealer,
      catatan,
      statusslik,
      nikpasangan,
      namapasangan,
      tempatlahirpasangan,
      tgllahirpasangan,
      alamatpasangan,
      rtpasangan,
      rwpasangan,
      kelpasangan,
      kecpasangan,
      kotapasangan,
      provinsipasangan,
      umur,
      jeniskelamin,
      created_by,
      updated_by,
    } = req.body;

    // if (cabang && cabang.toUpperCase() === "JAKARTA") {
    //   cabang = "JKT";
    // }

    // if (cabang && cabang.toUpperCase() === "DEPOK") {
    //   cabang = "DPK";
    // }

    if (cabang) {
      const cabangData = await data_cabang.findOne({
        where: {
          cabang: cabang.toUpperCase(),
        },
      });

      if (cabangData && cabangData.kode_cabang) {
        cabang = cabangData.kode_cabang;
      }
    }

    // ✅ Generate full URL
    const baseUrl = "http://217.196.49.162:3000/uploads";
    const fotoktpFile = req.files["fotoktp"]?.[0]?.filename || null;
    const fotoktppasanganFile =
      req.files["fotoktppasangan"]?.[0]?.filename || null;

    const fotoktp = fotoktpFile ? `${baseUrl}/${fotoktpFile}` : null;
    const fotoktppasangan = fotoktppasanganFile
      ? `${baseUrl}/${fotoktppasanganFile}`
      : null;

    // ✅ Generate application_id
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const tanggalKode = `${dd}${mm}${yyyy}`;

    const countToday = await DataPemohon.count({
      where: {
        cabang,
        created_date: {
          [require("sequelize").Op.gte]: new Date(
            `${yyyy}-${mm}-${dd}T00:00:00`
          ),
        },
      },
    });

    const running = String(countToday + 1).padStart(4, "0");
    const application_id = `${cabang}-${tanggalKode}-${running}`;

    // ✅ Insert ke DB, gunakan URL
    const data = await DataPemohon.create({
      application_id,
      cabang,
      statusperkawinan,
      nik,
      nama,
      tempatlahir,
      tgllahir,
      alamat,
      rt,
      rw,
      kel,
      kec,
      kota,
      provinsi,
      dealer,
      catatan,
      statusslik,
      nikpasangan,
      namapasangan,
      tempatlahirpasangan,
      tgllahirpasangan,
      alamatpasangan,
      rtpasangan,
      rwpasangan,
      kelpasangan,
      kecpasangan,
      kotapasangan,
      provinsipasangan,
      fotoktp,
      fotoktppasangan,
      umur,
      jeniskelamin,
      created_by,
      updated_by,
    });

    const fs = require("fs");
    // const path = require('path');
    const hasilSlikDir = path.join(
      __dirname,
      "..",
      "uploads",
      "HasilSLIK",
      application_id
    );
    fs.mkdirSync(hasilSlikDir, { recursive: true });

    // ✅ Buat subfolder berdasarkan nik dan nikpasangan
    if (nik) {
      const nikFolder = path.join(hasilSlikDir, nik);
      fs.mkdirSync(nikFolder, { recursive: true });
    }

    if (nikpasangan) {
      const nikPasanganFolder = path.join(hasilSlikDir, nikpasangan);
      fs.mkdirSync(nikPasanganFolder, { recursive: true });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ error: err.message });
  }
};

// exports.getList = async (req, res) => {
//   try {
//     const data = await DataPemohon.findAll({
//       attributes: [
//         "application_id",
//         "nama",
//         "nik",
//         "alamat",
//         "uri_pefindo",
//         "uri_slik",
//         "uri_slik_pasangan",
//         "uri_pefindo_pasangan",
//         "is_survey",
//         "statusperkawinan",
//         "namapasangan",
//         "nikpasangan",
//         "alamatpasangan",
//         "created_date",
//         "fotoktp",
//         "fotoktppasangan",
//       ],
//     });
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// const { Op } = require("sequelize");

exports.getList = async (req, res) => {
  try {
    const data = await DataPemohon.findAll({
      attributes: [
        "application_id",
        "nama",
        "nik",
        "alamat",
        "uri_pefindo",
        "uri_slik",
        "uri_slik_pasangan",
        "uri_pefindo_pasangan",
        "summary_slik",
        "summary_slik_pasangan",
        "is_survey",
        "statusperkawinan",
        "namapasangan",
        "nikpasangan",
        "alamatpasangan",
        "created_date",
        "fotoktp",
        "fotoktppasangan",
        "created_by",
      ],
      order: [
        // urutkan yang uri_slik kosong/null dulu
        [
          Sequelize.literal(`
            CASE 
              WHEN uri_slik IS NULL OR uri_slik = '' THEN 0 
              ELSE 1 
            END
          `),
          "ASC",
        ],
        // lalu urutkan created_date terbaru
        ["created_date", "DESC"],
      ],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getListDF = async (req, res) => {
  try {
    const data = await DataPemohon.findAll({
      attributes: [
        "application_id",
        "nama",
        "nik",
        "alamat",
        "uri_pefindo",
        "uri_slik",
        "uri_slik_pasangan",
        "uri_pefindo_pasangan",
        "summary_slik",
        "summary_slik_pasangan",
        "is_survey",
        "statusperkawinan",
        "namapasangan",
        "nikpasangan",
        "alamatpasangan",
        "created_date",
        "fotoktp",
        "fotoktppasangan",
        "created_by",
      ],
      include: [
        {
          model: DataUser,
          as : "user",
          attributes: ["username", "role"],
          where: {
            role: "admin_df",
          },
        },
      ],
      order: [
        [
          Sequelize.literal(`
            CASE 
              WHEN uri_slik IS NULL OR uri_slik = '' THEN 0 
              ELSE 1 
            END
          `),
          "ASC",
        ],
        ["created_date", "DESC"],
      ],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getListOCR = async (req, res) => {
  try {
    const query = `
      SELECT application_id,
        concat('summary','_',split_part(uri_slik, '/', -1)) AS filename, 
        concat('summary','_',split_part(uri_slik_pasangan, '/', -1)) AS filenamepasangan,
        regexp_replace(
          uri_slik,
          '^http://217\.196\.49\.162:3000',
          '/opt/be'
        ) AS filepdf,
        regexp_replace(
          uri_slik_pasangan,
          '^http://217\.196\.49\.162:3000',
          '/opt/be'
        ) AS filepdfpasangan,
        regexp_replace(
          regexp_replace(uri_slik, '/[^/]+$', ''), 
          '^http://217\\.196\\.49\\.162:3000', 
          '/opt/be'
        ) AS folder_path,
        regexp_replace(
          regexp_replace(uri_slik_pasangan, '/[^/]+$', ''), 
          '^http://217\\.196\\.49\\.162:3000', 
          '/opt/be'
        ) AS folder_path_pasangan
      FROM mobile.data_pemohon a
      left join mobile.users b on b.username = a.created_by 
 WHERE (
  (
    (summary_slik IS NULL OR summary_slik = '')
    AND a.uri_slik IS NOT NULL
  )
  OR
  (
    (summary_slik_pasangan IS NULL OR summary_slik_pasangan = '')
    AND a.uri_slik_pasangan IS NOT NULL
  )
)
AND created_date::date >= DATE '2026-04-29'
AND a.is_survey = 1
    `;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getListOCRDF = async (req, res) => {
  try {
    const query = `
                      SELECT application_id,
        concat('summary','_',split_part(uri_slik, '/', -1)) AS filename, 
        concat('summary','_',split_part(uri_slik_pasangan, '/', -1)) AS filenamepasangan,
        regexp_replace(
          uri_slik,
          '^http://217\.196\.49\.162:3000',
          '/opt/be'
        ) AS filepdf,
        regexp_replace(
          uri_slik_pasangan,
          '^http://217\.196\.49\.162:3000',
          '/opt/be'
        ) AS filepdfpasangan,
        regexp_replace(
          regexp_replace(uri_slik, '/[^/]+$', ''), 
          '^http://217\\.196\\.49\\.162:3000', 
          '/opt/be'
        ) AS folder_path,
        regexp_replace(
          regexp_replace(uri_slik_pasangan, '/[^/]+$', ''), 
          '^http://217\\.196\\.49\\.162:3000', 
          '/opt/be'
        ) AS folder_path_pasangan
      FROM mobile.data_pemohon a
      left join mobile.users b on b.username = a.created_by 
      WHERE (
  (
    (summary_slik IS NULL OR summary_slik = '')
    AND a.uri_slik IS NOT NULL
  )
  OR
  (
    (summary_slik_pasangan IS NULL OR summary_slik_pasangan = '')
    AND a.uri_slik_pasangan IS NOT NULL
  )
)
AND created_date::date >= DATE '2026-03-06' and b.role = 'admin_df' and a.application_id <> 'JKT-12032026-0037'
    `;

    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getListOCR = async (req, res) => {
//   try {
//     const data = await DataPemohon.findAll({
//       attributes: [
//         "application_id",
//         "nik",
//         "uri_slik",
//         "uri_slik_pasangan",
//         "summary_slik",
//         "summary_slik_pasangan"
//       ],
//     });

//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getDetailPemohon = async (req, res) => {
  try {
    const { application_id, nik } = req.params; // ambil filter dari query parameter

    const whereClause = {};
    if (application_id) whereClause.application_id = application_id;
    if (nik) whereClause.nik = nik;

    const data = await DataPemohon.findOne({
      where: whereClause,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getListpasangan = async (req, res) => {
  try {
    const { application_id, nik } = req.params; // ambil filter dari query parameter

    const whereClause = {};
    if (application_id) whereClause.application_id = application_id;
    if (nik) whereClause.nik = nik;

    const data = await DataPemohon.findAll({
      attributes: [
        "application_id",
        "nama",
        "nik",
        "alamat",
        "uri_pefindo",
        "uri_slik",
        "statusslik",
        "statusperkawinan",
        "namapasangan",
        "nikpasangan",
        "alamatpasangan",
      ],
      where: whereClause,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await DataPemohon.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll2 = async (req, res) => {
  try {
    const { created_by } = req.params;

    const data = await DataPemohon.findAll({ where: { created_by } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// untuk G-SURE
exports.getDataForSURE = async (req, res) => {
  try {
    const { created_by } = req.params;

    const data = await DataPemohon.findAll({
      where: {
        created_by,
        status: false,
      },
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatusForSurvey = async (req, res) => {
  try {
    const application_id = req.params.application_id;

    const existing = await DataPemohon.findOne({ where: { application_id } });
    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    const [updated] = await DataPemohon.update(
      { status: true },
      {
        where: { application_id },
      }
    );

    res.json({ updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await DataPemohon.update(req.body, {
      where: { id },
    });

    res.json({ updated: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateByApplicationId = async (req, res) => {
  try {
    const { application_id } = req.params; // ambil dari URL
    const { summary_slik, summary_slik_pasangan } = req.body; // ambil dari body

    // hanya update kolom yang dikirim
    const fieldsToUpdate = {};
    if (summary_slik !== undefined) fieldsToUpdate.summary_slik = summary_slik;
    if (summary_slik_pasangan !== undefined)
      fieldsToUpdate.summary_slik_pasangan = summary_slik_pasangan;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const [updated] = await DataPemohon.update(fieldsToUpdate, {
      where: { application_id },
    });

    if (updated === 0) {
      return res.status(404).json({ error: "application_id not found" });
    }

    res.json({ updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await DataPemohon.destroy({ where: { id } });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadSLIK = async (req, res) => {
  try {
    const { application_id } = req.params;
    const files = req.files;

    const pemohonFile = files.slik_pemohon?.[0];
    const pasanganFile = files.slik_pasangan?.[0];

    // Ambil data pemohon dari DB
    const pemohonData = await DataPemohon.findOne({
      where: { application_id },
    });

    if (!pemohonData) {
      return res.status(404).json({ message: "Data pemohon tidak ditemukan" });
    }

    const nikPemohon = pemohonData.nik;
    const nikPasangan = pemohonData.nikpasangan;

    const baseFolder = "/opt/be/uploads/HasilSLIK";
    const baseUrl = "http://217.196.49.162:3000/uploads/HasilSLIK";

    let uri_slik = null;
    let uri_slik_pasangan = null;

    // Simpan file SLIK Pemohon
    if (pemohonFile && nikPemohon) {
      const pemohonPath = path.join(baseFolder, application_id, nikPemohon);
      fs.mkdirSync(pemohonPath, { recursive: true });

      const savePath = path.join(pemohonPath, `${nikPemohon}.pdf`);
      // fs.writeFileSync(savePath, pemohonFile.buffer);
      fs.renameSync(pemohonFile.path, savePath); // pindahkan file dari lokasi tmp ke tujuan final

      uri_slik = `${baseUrl}/${application_id}/${nikPemohon}/${nikPemohon}.pdf`;
    }

    // Simpan file SLIK Pasangan
    if (pasanganFile && nikPasangan) {
      const pasanganPath = path.join(baseFolder, application_id, nikPasangan);
      fs.mkdirSync(pasanganPath, { recursive: true });

      const savePath = path.join(pasanganPath, `${nikPasangan}.pdf`);
      // fs.writeFileSync(savePath, pasanganFile.buffer);
      fs.renameSync(pasanganFile.path, savePath); // pindahkan file dari lokasi tmp ke tujuan final

      uri_slik_pasangan = `${baseUrl}/${application_id}/${nikPasangan}/${nikPasangan}.pdf`;
    }

    // Update database
    await DataPemohon.update(
      { uri_slik, uri_slik_pasangan },
      { where: { application_id } }
    );

    res.status(200).json({
      message: "Upload berhasil",
      uri_slik,
      uri_slik_pasangan,
    });
  } catch (err) {
    console.error("Upload SLIK error:", err);
    res.status(500).json({ message: "Gagal upload SLIK", error: err.message });
  }
};

exports.uploadPEFINDO = async (req, res) => {
  try {
    const { application_id } = req.params;
    const files = req.files;

    const pemohonFile = files.pefindo_pemohon?.[0];
    const pasanganFile = files.pefindo_pasangan?.[0];

    // Ambil data pemohon dari DB
    const pemohonData = await DataPemohon.findOne({
      where: { application_id },
    });

    if (!pemohonData) {
      return res.status(404).json({ message: "Data pemohon tidak ditemukan" });
    }

    const nikPemohon = pemohonData.nik;
    const nikPasangan = pemohonData.nikpasangan;

    const baseFolder = "/opt/be/uploads/HasilPefindo";
    const baseUrl = "http://217.196.49.162:3000/uploads/HasilPefindo";

    let uri_pefindo = null;
    let uri_pefindo_pasangan = null;

    // Simpan file SLIK Pemohon
    if (pemohonFile && nikPemohon) {
      const pemohonPath = path.join(baseFolder, application_id, nikPemohon);
      fs.mkdirSync(pemohonPath, { recursive: true });

      const savePath = path.join(pemohonPath, `${nikPemohon}.pdf`);
      // fs.writeFileSync(savePath, pemohonFile.buffer);
      fs.renameSync(pemohonFile.path, savePath); // pindahkan file dari lokasi tmp ke tujuan final

      uri_pefindo = `${baseUrl}/${application_id}/${nikPemohon}/${nikPemohon}.pdf`;
    }

    // Simpan file SLIK Pasangan
    if (pasanganFile && nikPasangan) {
      const pasanganPath = path.join(baseFolder, application_id, nikPasangan);
      fs.mkdirSync(pasanganPath, { recursive: true });

      const savePath = path.join(pasanganPath, `${nikPasangan}.pdf`);
      // fs.writeFileSync(savePath, pasanganFile.buffer);
      fs.renameSync(pasanganFile.path, savePath); // pindahkan file dari lokasi tmp ke tujuan final

      uri_pefindo_pasangan = `${baseUrl}/${application_id}/${nikPasangan}/${nikPasangan}.pdf`;
    }

    // Update database
    await DataPemohon.update(
      { uri_pefindo, uri_pefindo_pasangan },
      { where: { application_id } }
    );

    res.status(200).json({
      message: "Upload berhasil",
      uri_pefindo,
      uri_pefindo_pasangan,
    });
  } catch (err) {
    console.error("Upload PEFINDO error:", err);
    res
      .status(500)
      .json({ message: "Gagal upload PEFINDO", error: err.message });
  }
};
