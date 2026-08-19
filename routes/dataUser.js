// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/dataUser");
const cabangController = require("../controllers/dataCabang");

// auth/login
router.post("/login", userController.loginUser);

// list with pagination & search
router.get("/users", userController.getUsers);

// get single user
router.get("/users/:id", userController.getUserById);

// create
router.post("/users", userController.createUser);

// update
router.put("/users/:id", userController.updateUser);

// delete
router.delete("/users/:id", userController.deleteUser);

// get cabang
router.get("/cabang/:id", cabangController.getCabangById);

module.exports = router;
