module.exports = (sequelize, DataTypes) => {
  const DataDealer = sequelize.define(
    "DataDealer",
    {
      kdcab: DataTypes.STRING,
      pmosurvey: DataTypes.STRING,
      kddealer: DataTypes.STRING,
      namadealer: DataTypes.STRING,
      namabranddealer: DataTypes.STRING,
      namagroupdealer: DataTypes.STRING,
      telpon: DataTypes.STRING,
      nohpdealer: DataTypes.STRING,
      emaildealer: DataTypes.STRING,
      // ==================== //
      lokasiusahadealer: DataTypes.STRING,
      alamatdealer: DataTypes.STRING,
      rtdealer: DataTypes.STRING,
      rwdealer: DataTypes.STRING,
      kelurahandealer: DataTypes.STRING,
      kecamatandealer: DataTypes.STRING,
      kotadealer: DataTypes.STRING,
      provinsi: DataTypes.STRING,
      kodeposdealer: DataTypes.STRING,
      // ==================== //
      pemilik: DataTypes.STRING,
      emailpemilik: DataTypes.STRING,
      telponpemilik: DataTypes.STRING,
      hp: DataTypes.STRING,
      alamatpemilik: DataTypes.STRING,
      rtpemilik: DataTypes.STRING,
      rwpemilik: DataTypes.STRING,
      kelurahanpemilik: DataTypes.STRING,
      kecamatanpemilik: DataTypes.STRING,
      kotapemilik: DataTypes.STRING,
      provinsipemilik: DataTypes.STRING,
      // ==================== //
      pengelola: DataTypes.STRING,
      emailpengelola: DataTypes.STRING,
      telponpengelola: DataTypes.STRING,
      hppengelola: DataTypes.STRING,
      alamatpengelola: DataTypes.STRING,
      rtpengelola: DataTypes.STRING,
      rwpengelola: DataTypes.STRING,
      kelurahanpengelola: DataTypes.STRING,
      kecamatanpengelola: DataTypes.STRING,
      kotapengelola: DataTypes.STRING,
      provinsipengelola: DataTypes.STRING,
      // ==================== //
      lamausaha: DataTypes.STRING,
      statusmilikusaha: DataTypes.STRING,
      jumlahstok: DataTypes.STRING,
      ratapenjualan: DataTypes.STRING,
      ratapenjualankredit: DataTypes.STRING,
      ratatahunkendaraan: DataTypes.JSON,
      ratahargaotr: DataTypes.JSON,
      omset: DataTypes.STRING,
      kompetitor: DataTypes.JSON,
      jenisdelaer: DataTypes.STRING,
      // ==================== //
      namadealer1: DataTypes.STRING,
      alamatdealer1: DataTypes.STRING,
      telpondealer1: DataTypes.STRING,
      ownerdealer1: DataTypes.STRING,
      namadealer2: DataTypes.STRING,
      alamatdealer2: DataTypes.STRING,
      telpondealer2: DataTypes.STRING,
      ownerdealer2: DataTypes.STRING,
      // ==================== //
      // is_approved: DataTypes.BOOLEAN,
      is_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true, // ini penting
        defaultValue: null,
      },
      application_id: { type: DataTypes.STRING, allowNull: false },
      created_by: DataTypes.STRING,
      updated_by: DataTypes.STRING,
    },
    {
      tableName: "data_dealer",
      schema: "mobile",
      freezeTableName: true,
      timestamps: true, // ✅ AKTIFKAN TIMESTAMP
      createdAt: "created_at", // ✅ map createdAt ke created_at
      updatedAt: "updated_at", // ✅ map updatedAt ke updated_at
    }
  );

  return DataDealer;
};
