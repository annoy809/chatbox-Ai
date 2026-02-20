const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true },
  },
  { _id: false } // Prevent Mongoose from adding _id to each message
  
);

const ChatSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    title: { type: String, default: "New chat" },

    messages: { type: [MessageSchema], default: [] },

    autoTitle: { type: Boolean, default: false },

    // 🔥 ADD THESE
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Chat", ChatSchema);
