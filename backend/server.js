const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const passport = require("passport");
require("./utils/passport"); // 👈 VERY IMPORTANT (loads strategies)

dotenv.config();

// Routes
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

/* ================= CORS (LOCAL + DEPLOY SAFE) ================= */
// 🔥 IMPORTANT: Frontend deploy hone ke baad CORS block na ho
/* ================= CORS (LOCAL + DEPLOY SAFE - FINAL) ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chatbox-ai-c6q1.onrender.com",
  "https://chatbox-ai-five.vercel.app", // ✅ CORRECT (no double https, no slash)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 🔥 VERY IMPORTANT for login cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= Body Parser ================= */
app.use(express.json());

/* ================= Passport Init FIRST ================= */
app.use(passport.initialize()); // 🔥 correct position

/* ================= API Routes ================= */
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes); // ✅ chat routes working

/* ================= Health Check ================= */
app.get("/", (req, res) => {
  res.send("🚀 AI Backend Running (Production Ready)");
});

/* ================= MongoDB ================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};
connectDB();

/* ================= Server (RENDER SAFE) ================= */
// 🔥 VERY IMPORTANT for Render deployment
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

/* ================= Debug ================= */
console.log(
  "🔑 OpenRouter Key:",
  process.env.OPENROUTER_API_KEY ? "LOADED" : "MISSING"
);