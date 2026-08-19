module.exports = (sequelize, DataTypes) => {
  const DataPemohon = sequelize.define(
    "data_pemohon",
    {
      cabang: DataTypes.STRING,
      statusperkawinan: DataTypes.STRING,
      nik: DataTypes.STRING,
      nama: DataTypes.STRING,
      tempatlahir: DataTypes.STRING,
      tgllahir: DataTypes.DATE,
      alamat: DataTypes.TEXT,
      rt: DataTypes.STRING,
      rw: DataTypes.STRING,
      kel: DataTypes.STRING,
      kec: DataTypes.STRING,
      kota: DataTypes.STRING,
      provinsi: DataTypes.STRING,
      fotoktp: DataTypes.STRING,
      dealer: DataTypes.STRING,
      catatan: DataTypes.TEXT,
      statusslik: DataTypes.STRING,
      nikpasangan: DataTypes.STRING,
      namapasangan: DataTypes.STRING,
      tempatlahirpasangan: DataTypes.STRING,
      tgllahirpasangan: DataTypes.DATE,
      alamatpasangan: DataTypes.TEXT,
      rtpasangan: DataTypes.STRING,
      rwpasangan: DataTypes.STRING,
      kelpasangan: DataTypes.STRING,
      kecpasangan: DataTypes.STRING,
      kotapasangan: DataTypes.STRING,
      provinsipasangan: DataTypes.STRING,
      fotoktppasangan: DataTypes.STRING,
      umur: DataTypes.STRING,
      jeniskelamin: DataTypes.STRING,
      is_survey: DataTypes.STRING,
      uri_slik: DataTypes.STRING,
      uri_pefindo: DataTypes.STRING,
      uri_slik_pasangan: DataTypes.STRING,
      uri_pefindo_pasangan: DataTypes.STRING,
      summary_slik: DataTypes.STRING,
      summary_slik_pasangan: DataTypes.STRING,
      application_id: { type: DataTypes.STRING, allowNull: false },
      created_by: DataTypes.STRING,
      updated_by: DataTypes.STRING,
      created_date: DataTypes.DATE,
      status: DataTypes.BOOLEAN,
    },
    {
      tableName: "data_pemohon",
      schema: "mobile",
      freezeTableName: true,
      timestamps: true, // ✅ AKTIFKAN TIMESTAMP
      createdAt: "created_date", // ✅ map createdAt ke created_date
      updatedAt: "updated_date", // ✅ map updatedAt ke updated_date
    }
  );

  return DataPemohon;
};
