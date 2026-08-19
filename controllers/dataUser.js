// controllers/dataUser.js
const { DataUser } = require("../models");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const SECRET_KEY = process.env.JWT_SECRET || "ur19ghf8b56lcyi@ihr45UGodj47";

// helper: normalisasi is_active
const normalizeIsActive = (val) => {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  return false;
};

// ----------------- LOGIN (existing) -----------------
// exports.loginUser = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // find user by username
//     const checkUsername = await DataUser.findOne({
//       where: {
//         username: username,
//       },
//     });

//     if (!checkUsername)
//       return res.status(401).send({
//         status: "Login failed",
//         message: "Your Credentials is not valid",
//       });

//     // NOTE: if your DB currently stores plaintext password you can compare directly.
//     // It's better to use bcrypt hashing in DB. Here we support both:
//     const stored = checkUsername.password || "";

//     let passwordMatches = false;
//     if (!stored) {
//       passwordMatches = false;
//     } else {
//       // try bcrypt compare (if password hashed)
//       try {
//         passwordMatches = await bcrypt.compare(password, stored);
//       } catch (e) {
//         // fallback to plain text compare (not recommended)
//         passwordMatches = password === stored;
//       }
//     }

//     if (!passwordMatches)
//       return res.status(401).send({
//         status: "Login failed",
//         message: "Your Credentials is not valid",
//       });

//     const token = jwt.sign({ id: checkUsername.id }, SECRET_KEY);

//     res.send({
//       status: "Success",
//       message: "Login Success",
//       data: {
//         user: {
//           id: checkUsername.id,
//           name: checkUsername.name,
//           username: checkUsername.username,
//           role: checkUsername.role,
//           cabang: checkUsername.cabang || null,
//           token,
//         },
//       },
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).send({
//       status: "Error",
//       message: "Server Error : " + error.message,
//     });
//   }
// };
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // find user by username
    const checkUsername = await DataUser.findOne({
      where: {
        username: username,
      },
    });

    if (!checkUsername) {
      return res.status(401).send({
        status: "Login failed",
        message: "Your Credentials is not valid",
      });
    }

    // 1. CEK STATUS AKTIF AKUN SEBELUM CEK PASSWORD
    if (checkUsername.is_active === false) {
      return res.status(403).send({
        status: "Login failed",
        message: "Akun Anda telah dinonaktifkan karena 3x salah password. Silakan hubungi Admin.",
      });
    }

    // NOTE: if your DB currently stores plaintext password you can compare directly.
    // It's better to use bcrypt hashing in DB. Here we support both:
    const stored = checkUsername.password || "";

    let passwordMatches = false;
    if (!stored) {
      passwordMatches = false;
    } else {
      // try bcrypt compare (if password hashed)
      try {
        passwordMatches = await bcrypt.compare(password, stored);
      } catch (e) {
        // fallback to plain text compare (not recommended)
        passwordMatches = password === stored;
      }
    }

    // 2. JIKA PASSWORD SALAH
    if (!passwordMatches) {
      // Tambah jumlah percobaan gagal
      let attempts = (checkUsername.failed_login_attempts || 0) + 1;
      checkUsername.failed_login_attempts = attempts;

      // Jika gagal sudah 3 kali atau lebih, blokir akun
      if (attempts >= 3) {
        checkUsername.is_active = false;
      }

      // Simpan perubahan ke database
      await checkUsername.save();

      // Berikan response sesuai status pemblokiran
      if (attempts >= 3) {
        return res.status(403).send({
          status: "Login failed",
          message: "Akun Anda telah dinonaktifkan karena 3x salah password. Silakan hubungi Admin.",
        });
      } else {
        return res.status(401).send({
          status: "Login failed",
          message: `Your Credentials is not valid. Kesempatan login sisa ${3 - attempts} kali lagi.`,
        });
      }
    }

    // 3. JIKA PASSWORD BENAR, RESET PERCOBAAN GAGAL MENJADI 0
    if (checkUsername.failed_login_attempts > 0) {
      checkUsername.failed_login_attempts = 0;
      await checkUsername.save();
    }

    const token = jwt.sign({ id: checkUsername.id }, SECRET_KEY);

    res.send({
      status: "Success",
      message: "Login Success",
      data: {
        user: {
          id: checkUsername.id,
          name: checkUsername.name,
          username: checkUsername.username,
          role: checkUsername.role,
          cabang: checkUsername.cabang || null,
          token,
        },
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Error",
      message: "Server Error : " + error.message,
    });
  }
};

// ----------------- LIST (existing) -----------------
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const q = req.query.q ? req.query.q.trim() : null;
    const role = req.query.role ? req.query.role.trim() : null;

    const where = {};

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { username: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const { count, rows } = await DataUser.findAndCountAll({
      where,
      offset,
      limit,
      order: [["created_at", "DESC"]],
      attributes: {
        exclude: ["password"],
      },
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      status: "Success",
      message: "List users retrieved",
      data: {
        meta: {
          total: count,
          page,
          limit,
          totalPages,
        },
        users: rows,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Error",
      message: "Server Error: " + error.message,
    });
  }
};
// exports.getUsers = async (req, res) => {
//   try {
//     // query params: page, limit, q (search)
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const offset = (page - 1) * limit;
//     const q = req.query.q ? req.query.q.trim() : null;

//     const where = {};
//     // jika ada query pencarian, cari di name, username, atau email
//     if (q) {
//       where[Op.or] = [
//         { name: { [Op.iLike]: `%${q}%` } }, // Postgres: iLike
//         { username: { [Op.iLike]: `%${q}%` } },
//         { email: { [Op.iLike]: `%${q}%` } },
//       ];
//     }

//     const { count, rows } = await DataUser.findAndCountAll({
//       where,
//       offset,
//       limit,
//       order: [["created_at", "DESC"]],
//       attributes: {
//         // jangan include password
//         exclude: ["password"],
//       },
//     });

//     const totalPages = Math.ceil(count / limit);

//     res.status(200).json({
//       status: "Success",
//       message: "List users retrieved",
//       data: {
//         meta: {
//           total: count,
//           page,
//           limit,
//           totalPages,
//         },
//         users: rows,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "Error",
//       message: "Server Error: " + error.message,
//     });
//   }
// };

// ----------------- GET 1 USER -----------------
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await DataUser.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });
    }

    res.json({ status: "Success", data: { user } });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "Error", message: "Server Error: " + error.message });
  }
};

// ----------------- CREATE USER -----------------
exports.createUser = async (req, res) => {
  try {
    const payload = req.body || {};

    // basic validation
    if (!payload.username || !payload.name) {
      return res.status(400).json({
        status: "Error",
        message: "Missing required fields: username/name",
      });
    }

    // prevent duplicate username
    const exists = await DataUser.findOne({
      where: { username: payload.username },
    });
    if (exists) {
      return res
        .status(409)
        .json({ status: "Error", message: "Username already exists" });
    }

    // prepare data
    const newUser = {
      name: payload.name,
      email: payload.email || null,
      username: payload.username,
      role: payload.role || "user",
      cabang: payload.cabang || null,
      no_hp: payload.no_hp || null,
      photoUrl: payload.photoUrl || null,
      is_active: normalizeIsActive(payload.is_active),
    };

    // handle password: if provided, hash it; otherwise set to empty string or reject
    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(payload.password, salt);
    } else {
      // you may want to enforce password presence; for now set to empty string
      newUser.password = "";
    }

    const created = await DataUser.create(newUser);

    // return created user without password
    const { password, ...safeUser } = created.get({ plain: true });

    res.status(201).json({
      status: "Success",
      message: "User created",
      data: { user: safeUser },
    });
  } catch (error) {
    console.error("createUser error:", error);
    res
      .status(500)
      .json({ status: "Error", message: "Server Error: " + error.message });
  }
};

// ----------------- UPDATE USER -----------------
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};

    const user = await DataUser.findByPk(id);
    if (!user)
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });

    // prepare update fields
    const updates = {};
    if (typeof payload.name !== "undefined") updates.name = payload.name;
    if (typeof payload.email !== "undefined") updates.email = payload.email;
    if (typeof payload.username !== "undefined")
      updates.username = payload.username;
    if (typeof payload.role !== "undefined") updates.role = payload.role;
    if (typeof payload.no_hp !== "undefined") updates.no_hp = payload.no_hp;
    if (typeof payload.cabang !== "undefined") updates.cabang = payload.cabang;
    if (typeof payload.photoUrl !== "undefined")
      updates.photoUrl = payload.photoUrl;
    if (typeof payload.is_active !== "undefined")
      updates.is_active = normalizeIsActive(payload.is_active);

    updates.failed_login_attempts = 0; // reset failed login attempts on update

    // handle password: only update if provided and not empty
    if (payload.password && payload.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(payload.password, salt);
    }

    await user.update(updates);

    const safe = (
      await DataUser.findByPk(id, { attributes: { exclude: ["password"] } })
    ).get({ plain: true });

    res.json({
      status: "Success",
      message: "User updated",
      data: { user: safe },
    });
  } catch (error) {
    console.error("updateUser error:", error);
    res
      .status(500)
      .json({ status: "Error", message: "Server Error: " + error.message });
  }
};

// ----------------- DELETE USER -----------------
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await DataUser.findByPk(id);
    if (!user)
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });

    await user.destroy(); // hard delete; change to soft delete if needed

    res.json({ status: "Success", message: "User deleted" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res
      .status(500)
      .json({ status: "Error", message: "Server Error: " + error.message });
  }
};

// ----------------- CHANGE PASSWORD -----------------
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        status: "Failed",
        message: "Old password and new password are required",
      });
    }

    // const user = await DataUser.findByPk(req.user.id);
    const user = await DataUser.findByPk(req.query.id);

    if (!user) {
      return res.status(404).send({
        status: "Failed",
        message: "User not found",
      });
    }

    // cek password lama
    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).send({
        status: "Failed",
        message: "Old password is incorrect",
      });
    }

    // hash password baru
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await user.update({
      password: hashedPassword,
    });

    return res.send({
      status: "Success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      status: "Error",
      message: error.message,
    });
  }
};