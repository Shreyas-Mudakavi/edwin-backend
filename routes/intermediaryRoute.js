const express = require("express");

const {
  getUser,
  intermediaryLogin,
  getAllClients,
  getIntermeUser,
} = require("../controllers/userController");
const { auth, isIntermediary } = require("../middlewares/auth");
const {
  getQuote,
  getClientQuotes,
  getMyQuotesReq,
  addQuote,
  updateQuoteStatus,
  getClientQuotesInfo,
} = require("../controllers/quoteController");
const {
  addIntermediaryClient,
  updateIntermediaryClient,
  deleteClient,
} = require("../controllers/intermediaryController");
const {
  getNotification,
  markReadNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/login", intermediaryLogin);

router.post("/client/add", auth, isIntermediary, addIntermediaryClient);
router.get("/user/all", auth, isIntermediary, getAllClients);
router.get("/user/:id", auth, isIntermediary, getIntermeUser);
router.put("/user-update/:id", auth, isIntermediary, updateIntermediaryClient);
router.delete("/user-delete/:id", auth, isIntermediary, deleteClient);

router.get("/getAll-quotes", auth, isIntermediary, getClientQuotes);
router.get("/get-quote/:id", auth, isIntermediary, getQuote);
router.get("/get-clientQuotes/:id", auth, isIntermediary, getClientQuotesInfo);
router.put("/update-quote-status/:id", auth, isIntermediary, updateQuoteStatus);

router.get("/getAll-my-quotes", auth, isIntermediary, getMyQuotesReq);
router.post("/add-quote", auth, isIntermediary, addQuote);

router.get("/get-notification", auth, isIntermediary, getNotification);
router.put("/mark-read/:id", auth, isIntermediary, markReadNotification);

module.exports = router;
