const express = require("express");

const {
  getUser,
  updateUser,
  deleteUser,
  intermediaryLogin,
  getAllClients,
} = require("../controllers/userController");
const { auth, isIntermediary } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", intermediaryLogin);

router.get("/user/all", auth, isIntermediary, getAllClients);

module.exports = router;
