require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "postgres",
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.DataPemohon = require("./dataPemohon")(sequelize, DataTypes);
db.DataUser = require("./dataUser")(sequelize, DataTypes);
db.dataDealer = require("./dataDealer")(sequelize, DataTypes);
db.dokumenDealer = require("./dokumenDealer")(sequelize, DataTypes);
db.data_cabang = require("./data_cabang")(sequelize, DataTypes);

db.DataPemohon.belongsTo(db.DataUser, {
  foreignKey: "created_by",
  targetKey: "username",
  as: "user",
});

module.exports = db;
