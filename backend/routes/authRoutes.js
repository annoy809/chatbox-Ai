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
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = req.user.token; // JWT from strategy
    res.redirect(`http://localhost:5173/?token=${token}`);
  }
);

module.exports = router;
