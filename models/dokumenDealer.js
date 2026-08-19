module.exports = (sequelize, DataTypes) => {
  const DokumenDealer = sequelize.define(
    "DokumenDealer",
    {
      ktpowner: DataTypes.TEXT,
      ktppengelola: DataTypes.TEXT,
      npwp: DataTypes.TEXT,
      siup: DataTypes.TEXT,
      fotodealer: DataTypes.TEXT,
      fotodealercmo: DataTypes.TEXT,
      fotostokunit1: DataTypes.TEXT,
      fotostokunit2: DataTypes.TEXT,
      application_id: { type: DataTypes.STRING, allowNull: false },
      created_by: DataTypes.STRING,
      updated_by: DataTypes.STRING,
    },
    {
      tableName: "dokumen_dealer",
      schema: "mobile",
      freezeTableName: true,
      timestamps: true, // ✅ AKTIFKAN TIMESTAMP
      createdAt: "created_at", // ✅ map createdAt ke created_at
      updatedAt: "updated_at", // ✅ map updatedAt ke updated_at
    }
  );

  return DokumenDealer;
};
