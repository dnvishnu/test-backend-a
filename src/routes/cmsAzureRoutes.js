const express = require("express");
const router = express.Router();
const cmsAzureController = require("../controllers/cmsAzureController");

router.post("/create-folder", cmsAzureController.createFolder);
router.get("/list-folder/:bucketName", cmsAzureController.listFolder);
router.get("/list-files-combined/:bucketName", cmsAzureController.listFilesCombined);
router.post("/edit-item", cmsAzureController.editItem);
router.get("/get-content", cmsAzureController.getContent);
router.post("/edit-content", cmsAzureController.editContent);
router.get("/download", cmsAzureController.downloadFile);
router.post("/dynamic-page", cmsAzureController.getDynamicPage);
router.delete("/item", cmsAzureController.deleteItem);

module.exports = router;
