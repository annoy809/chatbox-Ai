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

/* ================= CORS (LOCAL ONLY) ================= */
app.use(cors({
  origin: "http://localhost:5173",  // aapka frontend port
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


/* ================= Body Parser ================= */
app.use(express.json());


/* ================= Passport Init FIRST ================= */
app.use(passport.initialize()); // 🔥 MOVE THIS UP

/* ================= API Routes ================= */
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes); // ✅ now auth will work


/* ================= Health Check ================= */
app.get("/", (req, res) => {
  res.send("🚀 AI Backend Running (Local)");
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

/* ================= Server ================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

/* ================= Debug ================= */
console.log(
  "🔑 OpenRouter Key:",
  process.env.OPENROUTER_API_KEY ? "LOADED" : "MISSING"
);
