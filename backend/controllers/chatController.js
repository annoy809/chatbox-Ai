const Chat = require("../models/Chat");
const mongoose = require("mongoose");


/* ================= Save or update chat ================= */
exports.saveChat = async (req, res) => {
  try {
    const { chatId, messages, title } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array required" });
    }

    // 🧠 Auto-generate title from first user message if not provided
    let finalTitle = title;
    if (!finalTitle) {
      const firstUserMsg = messages.find((m) => m.type === "user");
      finalTitle = firstUserMsg?.text?.slice(0, 40) || "New chat";
    }

    if (chatId) {
      // ✅ Update existing chat
      const updatedChat = await Chat.findOneAndUpdate(
        { _id: chatId, userId: req.user.id },
        { messages, title: finalTitle },
        { new: true, upsert: true } // upsert ensures chat is created if missing
      );

      return res.json(updatedChat);
    }

    // ✅ Create new chat
    const newChat = await Chat.create({
      userId: req.user.id,
      messages,
      title: finalTitle,
    });

    res.json(newChat);
  } catch (err) {
    console.error("❌ Save chat error:", err);
    res.status(500).json({ message: "Failed to save chat" });
  }
};

/* ================= Get all chats of logged-in user ================= */
exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });

    res.json(
      chats.map((chat) => ({
        _id: chat._id,
        title: chat.title,
        messages: chat.messages,
        date: chat.updatedAt || chat.createdAt,
      }))
    );
  } catch (err) {
    console.error("❌ Get chats error:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

/* ================= Get single chat ================= */
exports.getSingleChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json({
      _id: chat._id,
      title: chat.title,
      messages: chat.messages,
      date: chat.updatedAt || chat.createdAt,
    });
  } catch (err) {
    console.error("❌ Get single chat error:", err);
    res.status(500).json({ message: "Failed to load chat" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;

    console.log("Delete request for ID:", chatId);
    console.log("Logged user:", req.user);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    // 🔥 Step 1: Find chat ONLY by ID (not userId)
    const chat = await Chat.findById(chatId);

    if (!chat) {
      console.log("❌ Chat not found in DB");
      return res.status(404).json({ message: "Chat not found" });
    }

    // 🔥 Step 2: Safe ownership check (matches your schema)
    if (chat.userId && chat.userId !== req.user.id) {
      console.log("❌ Unauthorized delete attempt");
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔥 Step 3: Delete
    await Chat.findByIdAndDelete(chatId);

    console.log("✅ Chat deleted:", chatId);

    res.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (err) {
    console.error("❌ Delete chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= Rename Chat ================= */
exports.renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chatId = req.params.id;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: req.user.id },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ message: "Rename failed" });
  }
};

/* ================= Pin Chat ================= */
exports.togglePinChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.isPinned = !chat.isPinned;
    await chat.save();

    res.json(chat);
  } catch (err) {
    console.error("Pin error:", err);
    res.status(500).json({ message: "Pin failed" });
  }
};


/* ================= Archive Chat ================= */
exports.toggleArchiveChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.isArchived = !chat.isArchived;
    await chat.save();

    res.json(chat);
  } catch (err) {
    console.error("Archive error:", err);
    res.status(500).json({ message: "Archive failed" });
  }
};
