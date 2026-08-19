const { dataDealer } = require("../models");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
// const path = require('path');

exports.getDealer = async (req, res) => {
  try {
    const data = await dataDealer.findAll();
    res.status(200).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

exports.getDealerActive = async (req, res) => {
  try {
    const data = await dataDealer.findAll({
      attributes: ["id", "kdcab", "namadealer"],
      where: {
        is_approved: true,
      },
    });
    res.status(200).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

exports.getDealerById = async (req, res) => {
  try {
    const data = await dataDealer.findByPk(req.params.id);
    res.status(200).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

exports.getDealerByCMO = async (req, res) => {
  try {
    const createdBy = req.params.created_by;

    const data = await dataDealer.findAll({
      where: { created_by: createdBy }, // now filtering by a column, not primary key
    });

    res.status(200).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

exports.createDealer = async (req, res) => {
  try {
    // ✅ Generate application_id
    let { kddealer } = req.body;
    const prefix = "DEALER";

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const tanggalKode = `${dd}${mm}${yyyy}`;

    const countToday = await dataDealer.count({
      where: {
        // kddealer,
        created_at: {
          [require("sequelize").Op.gte]: new Date(
            `${yyyy}-${mm}-${dd}T00:00:00`
          ),
        },
      },
    });

    const running = String(countToday + 1).padStart(4, "0");
    // const application_id = `${kddealer}-${tanggalKode}-${running}`;
    const application_id = `${prefix}-${tanggalKode}-${running}`;

    req.body.application_id = application_id;
    const data = await dataDealer.create(req.body);
    res.status(201).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

exports.updateDealer = async (req, res) => {
  try {
    const data = await dataDealer.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(201).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

exports.deleteDealer = async (req, res) => {
  try {
    const data = await dataDealer.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};
