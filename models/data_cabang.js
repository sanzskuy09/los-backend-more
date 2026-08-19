module.exports = (sequelize, DataTypes) => {
  const DataCabang = sequelize.define(
    "data_cabang",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cabang: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      kode_cabang: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isactive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      alamat: {
        type: DataTypes.STRING,
      },
      created_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "data_cabang",
      schema: "mobile",
      timestamps: false,
    }
  );

  return DataCabang;
};
