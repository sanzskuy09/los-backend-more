const path = require("path");
const { dokumenDealer } = require("../models");

exports.uploadDealer = async (req, res) => {
  try {
    const { application_id } = req.body;

    if (!application_id) {
      return res.status(400).json({ error: "application_id wajib diisi" });
    }

    const expectedFields = [
      "ktpowner",
      "ktppengelola",
      "npwp",
      "siup",
      "fotodealer",
      "fotodealercmo",
      "fotostokunit1",
      "fotostokunit2",
    ];

    const updateData = {
      created_by: req.body.created_by || null,
    };

    for (let field of expectedFields) {
      if (req.files && req.files[field]) {
        updateData[
          field
        ] = `http://217.196.49.162:3000/uploads/dokumen_dealer/${application_id}/${req.files[field][0].filename}`;
      } else {
        updateData[field] = null;
      }
    }

    const existing = await dokumenDealer.findOne({
      where: { application_id },
    });

    if (existing) {
      const updatedFields = {};
      for (let key in req.files) {
        updatedFields[
          key
        ] = `http://217.196.49.162:3000/uploads/dokumen_dealer/${application_id}/${req.files[key][0].filename}`;
      }
      await existing.update(updatedFields);
      return res.json({
        message: "Berhasil update sebagian data",
        updatedFields,
      });
    } else {
      await dokumenDealer.create({ application_id, ...updateData });
      res.status(201).send({
        status: "Success",
        data: updateData,
      });
    }

    // const data = await dokumenDealer.create(req.body);
    // res.status(201).send({
    //   status: "Success",
    //   data: data,
    // });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

exports.getFotoByApp = async (req, res) => {
  const { application_id } = req.params;

  if (!application_id) {
    return res.status(400).json({ message: "application_id  wajib diisi" });
  }

  try {
    const data = await dokumenDealer.findOne({
      where: { application_id },
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

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
