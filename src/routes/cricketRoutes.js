const express = require("express");
const router = express.Router();
const cricketController = require("../controllers/cricketController");

router.get("/old-sitemap.xml", cricketController.getSitemapOld);
router.get("/upload-match", cricketController.uploadMatch);
router.get("/generate-summary", cricketController.generateSummary);
router.get("/get-sitemap", cricketController.getSitemap);
router.get("/get-sub-sitemaps", cricketController.getSubSitemap);

module.exports = router;
