const express = require("express");
const router = express.Router();
const controller = require("../controllers/dataPemohon");
const multer = require("multer");
const path = require("path");

// Setup Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Must be before controller.create
router.post(
  "/",
  upload.fields([
    { name: "fotoktp", maxCount: 1 },
    { name: "fotoktppasangan", maxCount: 1 },
  ]),
  controller.create
);

router.get("/", controller.getAll);
router.get("/getlist", controller.getList);
router.get("/getlist-df", controller.getListDF);
router.get("/getlistocr", controller.getListOCR);
router.get("/getlistocrdf", controller.getListOCRDF);
router.post("/update-summary/:application_id", controller.updateByApplicationId);

//updateByApplicationId

router.get(
  "/getdetailpemohon/:application_id/:nik",
  controller.getDetailPemohon
);
router.get("/getlistpasangan/:application_id/:nik", controller.getListpasangan);
router.get("/:created_by", controller.getAll2);
router.put("/:id", controller.update);
router.get("/order/:created_by", controller.getDataForSURE);
router.put("/order/update/:application_id", controller.updateStatusForSurvey);

router.post(
  "/upload-slik/:application_id",
  upload.fields([
    { name: "slik_pemohon", maxCount: 1 },
    { name: "slik_pasangan", maxCount: 1 },
  ]),
  controller.uploadSLIK
);


router.post(
  "/upload-pefindo/:application_id",
  upload.fields([
    { name: "pefindo_pemohon", maxCount: 1 },
    { name: "pefindo_pasangan", maxCount: 1 },
  ]),
  controller.uploadPEFINDO
);

module.exports = router;
