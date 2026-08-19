// controllers/approvalController.js
const { data_cabang } = require("../models");
const { Op } = require("sequelize");

exports.getAllCabang = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const q = (
      req.query.q ||
      req.query.cabang ||
      req.query.kode_cabang ||
      ""
    ).trim();

    const where = {};

    if (q) {
      where[Op.or] = [
        { cabang: { [Op.iLike]: `%${q}%` } },
        { kode_cabang: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await data_cabang.findAndCountAll({
      where,
      offset,
      limit,
      attributes: {
        exclude: ["updated_date"],
      },
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCabangById = async (req, res) => {
  try {
    const { id } = req.params;

    const cabangData = await data_cabang.findByPk(id, {
      attributes: {
        exclude: ["updated_date"],
      },
    });

    if (!cabangData) {
      return res.status(404).json({ message: "Cabang tidak ditemukan" });
    }

    res.json({
      data: cabangData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createCabang = async (req, res) => {
  try {
    const { cabang, kode_cabang, alamat, isactive } = req.body;

    if (!cabang || !kode_cabang) {
      return res
        .status(400)
        .json({ message: "cabang dan kode_cabang wajib diisi" });
    }

    const newCabang = await data_cabang.create({
      cabang,
      kode_cabang,
      alamat,
      isactive: isactive ?? true,
    });

    res.status(201).json({
      message: "Cabang berhasil dibuat",
      data: newCabang,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCabang = async (req, res) => {
  try {
    const { id } = req.params;
    const { cabang, kode_cabang, alamat, isactive } = req.body;

    const cabangData = await data_cabang.findByPk(id);

    if (!cabangData) {
      return res.status(404).json({ message: "Cabang tidak ditemukan" });
    }

    await cabangData.update({
      cabang,
      kode_cabang,
      alamat,
      isactive,
    });

    res.json({
      message: "Cabang berhasil diperbarui",
      data: cabangData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCabang = async (req, res) => {
  try {
    const { id } = req.params;

    const cabangData = await data_cabang.findByPk(id);

    if (!cabangData) {
      return res.status(404).json({ message: "Cabang tidak ditemukan" });
    }

    await cabangData.destroy();

    res.json({
      message: "Cabang berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
