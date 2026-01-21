const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

dotenv.config();

// Routes
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

/* ================= CORS ================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://chatbox-ai-c6q1.onrender.com", // ⚠️ backend self (safe)
  "https://https://chatbox-ai-five.vercel.app/"  // ⚠️ yahan apna Vercel URL daalna
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


/* ================= Body parser ================= */
app.use(express.json());

/* ================= Sessions (for OAuth if used) ================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

/* ================= Passport JWT ================= */
app.use(passport.initialize());
app.use(passport.session());

/* ================= API Routes ================= */
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes); // ✅ Matches frontend

/* ================= Health check ================= */
app.get("/", (req, res) => {
  res.send("🚀 AI Backend Running");
});

/* ================= MongoDB Connect ================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};
connectDB();

/* ================= Start server ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

/* ================= Debug ================= */
console.log("KEY LOADED:", process.env.OPENROUTER_API_KEY ? "YES" : "NO");
