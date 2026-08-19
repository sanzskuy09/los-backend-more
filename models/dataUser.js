module.exports = (sequelize, DataTypes) => {
  const DataUser = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: DataTypes.STRING,
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      photoUrl: DataTypes.DATE,
      role: DataTypes.TEXT,
      no_hp: DataTypes.STRING,
      cabang: DataTypes.STRING,
      failed_login_attempts: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      tableName: "users",
      schema: "mobile",
      freezeTableName: true,
      timestamps: true, // ✅ AKTIFKAN TIMESTAMP
      createdAt: "created_at", // ✅ map createdAt ke created_date
      updatedAt: "updated_at", // ✅ map updatedAt ke updated_date
    }
  );

  return DataUser;
};
