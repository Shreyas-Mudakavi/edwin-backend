const express = require("express");

const {
  getUser,
  intermediaryLogin,
  getAllClients,
} = require("../controllers/userController");
const { auth, isIntermediary } = require("../middlewares/auth");
const {
  getQuote,
  getClientQuotes,
  getMyQuotesReq,
  addQuote,
} = require("../controllers/quoteController");
const {
  addIntermediaryClient,
  updateIntermediaryClient,
  deleteClient,
} = require("../controllers/intermediaryController");

const router = express.Router();

router.post("/login", intermediaryLogin);

router.post("/client/add", auth, isIntermediary, addIntermediaryClient);
router.get("/user/all", auth, isIntermediary, getAllClients);
router.get("/user/:id", auth, isIntermediary, getUser);
router.put("/user-update/:id", auth, isIntermediary, updateIntermediaryClient);
router.delete("/user-delete/:id", auth, isIntermediary, deleteClient);

router.get("/getAll-quotes", auth, isIntermediary, getClientQuotes);
router.get("/get-quote/:id", auth, isIntermediary, getQuote);

router.get("/getAll-my-quotes", auth, isIntermediary, getMyQuotesReq);
router.post("/add-quote", auth, isIntermediary, addQuote);

module.exports = router;
