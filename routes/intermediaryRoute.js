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
  updateIntermediaryClient,
} = require("../controllers/intermediaryController");

const router = express.Router();

router.post("/login", intermediaryLogin);

router.post("/client/add", auth, isIntermediary, addIntermediaryClient);
router.get("/user/all", auth, isIntermediary, getAllClients);
router.get("/user/:id", auth, isIntermediary, getUser);
router.put("/user-update/:id", auth, isIntermediary, updateIntermediaryClient);
router.delete("/user-delete/:id", auth, isIntermediary, deleteUser);

router.get("/getAll-quotes", auth, isIntermediary, getQuotes);
router.get("/get-quote/:id", auth, isIntermediary, getQuote);

module.exports = router;
