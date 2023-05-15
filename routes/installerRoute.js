const express = require("express");
const { getInstallers } = require("../controllers/installerController");
const router = express.Router();

router.get("/get-installers", getInstallers);

module.exports = router;
