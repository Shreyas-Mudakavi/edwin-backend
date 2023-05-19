const express = require("express");

const {
  getUser,
  updateUser,
  deleteUser,
  intermediaryLogin,
  getAllClients,
} = require("../controllers/userController");
const { auth, isIntermediary } = require("../middlewares/auth");
const { getQuotes, getQuote } = require("../controllers/quoteController");
const {
  addIntermediaryClient,
} = require("../controllers/intermediaryController");

const router = express.Router();

router.post("/login", intermediaryLogin);

router.get("/user/all", auth, isIntermediary, getAllClients);
router.get("/user/:id", auth, isIntermediary, getUser);
router.post("/client/add", auth, isIntermediary, addIntermediaryClient);

router.get("/getAll-quotes", auth, isIntermediary, getQuotes);
router.get("/get-quote/:id", auth, isIntermediary, getQuote);

module.exports = router;
