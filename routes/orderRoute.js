const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  createOrder,
  getAll,
  getOrder,
  getRecent,
  verifyOrderStatus,
  redirectOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/add", auth, createOrder);

router.post("/webhook", verifyOrderStatus);

router.get("/get-order", auth, getOrder);

router.get("/recent-order", auth, getRecent);

router.get("/all", auth, getAll);

module.exports = router;
