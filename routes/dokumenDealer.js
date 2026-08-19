const express = require("express");
const router = express.Router();
const dokumenDealerController = require("../controllers/dokumenDealer");
const upload = require("../middleware/multerDokumenDealer");

const fields = [
  "ktpowner",
  "ktppengelola",
  "npwp",
  "siup",
  "fotodealer",
  "fotodealercmo",
  "fotostokunit1",
  "fotostokunit2",
].map((name) => ({ name, maxCount: 1 }));

router.post(
  "/upload",
  upload.fields(fields),
  dokumenDealerController.uploadDealer
);
router.get("/searchby/:application_id", dokumenDealerController.getFotoByApp);
// router.post("/create", dokumenDealerController.createDealer);
// router.put("/:id", dokumenDealerController.updateDealer);
// router.delete("/:id", dokumenDealerController.deleteDealer);

module.exports = router;
