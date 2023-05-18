const express = require("express");

const {
  getUser,
  updateUser,
  deleteUser,
  intermediaryLogin,
  getAllClients,
} = require("../controllers/userController");

const router = express.Router();

router.post("/login", intermediaryLogin);

router.get("/user/all", auth, isAdmin, getAllClients);

module.exports = router;
