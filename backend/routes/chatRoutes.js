const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const passport = require("passport");

// JWT auth middleware
const auth = passport.authenticate("jwt", { session: false });

/* ================= Chat Routes ================= */

// ✅ Save a new chat or update existing chat
// POST /api/chat/save
router.post("/save", auth, chatController.saveChat);

// ✅ Get all chats of the logged-in user
// GET /api/chat/my
router.get("/my", auth, chatController.getMyChats);

// ✅ Get a single chat by its ID
// GET /api/chat/:id
router.get("/:id", auth, chatController.getSingleChat);

module.exports = router;
