const express = require("express");
const { register, login } = require("../controllers/authController");
const passport = require("passport");
require("../utils/passport"); // Google strategy

const router = express.Router();

// Email/password
router.post("/register", register);
router.post("/login", login);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req, res) => {
    const token = req.user.token;

    // 🔥 FINAL FIX: NEVER fallback to localhost on production
    const FRONTEND_URL =
      process.env.FRONTEND_URL ||
      "https://chatbox-ai-five.vercel.app";

    res.redirect(`${FRONTEND_URL}/?token=${token}`);
  }
);

module.exports = router;