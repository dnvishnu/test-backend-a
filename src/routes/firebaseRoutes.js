const express = require("express");
const firebaseController = require("../controllers/firebaseController");

const router = express.Router();

router.post("/create-site", firebaseController.createSiteController);

module.exports = router;
