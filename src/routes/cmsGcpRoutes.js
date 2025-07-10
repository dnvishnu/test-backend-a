const express = require("express");
const router = express.Router();
const cmsGcpController = require("../controllers/cmsGcpController");

router.post("/create-folder", cmsGcpController.createFolder);
router.get("/list-folder/:bucketName", cmsGcpController.listFolder);
router.get("/list-files-combined/:bucketName", cmsGcpController.listFilesCombined);
router.post("/edit-item", cmsGcpController.editItem);
router.get("/get-content", cmsGcpController.getContent);
router.post("/edit-content", cmsGcpController.editContent);
router.get("/download", cmsGcpController.downloadFile);
router.post("/dynamic-page", cmsGcpController.getDynamicPage);
router.delete("/delete-item", cmsGcpController.deleteItem);

module.exports = router;
