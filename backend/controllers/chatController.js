const Chat = require("../models/Chat");

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
