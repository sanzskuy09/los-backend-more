const express = require("express");
const router = express.Router();
const dealerController = require("../controllers/dataDealer");

router.get("/all", dealerController.getDealer);
router.get("/active", dealerController.getDealerActive);
router.get("/:id", dealerController.getDealerById);
router.get("/user/:created_by", dealerController.getDealerByCMO);
router.post("/create", dealerController.createDealer);
router.put("/:id", dealerController.updateDealer);
router.delete("/:id", dealerController.deleteDealer);

module.exports = router;
