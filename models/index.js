const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("gratama", "postgres", "gratama2025@", {
  host: "217.196.49.162",
  dialect: "postgres",
});

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
