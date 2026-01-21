const express = require("express");
const router = express.Router();
const { handleAIRequest } = require("../controllers/aiController");

router.post("/chat", handleAIRequest);

module.exports = router;
