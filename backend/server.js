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
const allowedOrigins = [
  "http://localhost:5173", // Vite local
  "http://localhost:3000", // React local (optional)
  "https://chatbox-ai-c6q1.onrender.com", // (optional self)
  // 👉 YAHAN apna frontend deploy URL add karna (jab deploy ho)
  // Example:
  // "https://your-frontend.onrender.com",
  // "https://your-frontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(null, true); // 🔥 TEMP: allow all (safe for testing)
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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