import { Request, Response, Router } from "express";

const router = Router();

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

let messages: Message[] = [];

router.get("/chat", (_req, res) => {
  res.json({ messages });
});

router.post("/message", async (req: Request, res: Response): Promise<void> => {
  const { sender, content } = req.body;

  if (!sender || !content) {
    res.status(400).json({ error: "Sender and content are required" });
    return;
  }

  const newMessage: Message = {
    id: Math.random().toString(36).substring(7),
    sender,
    content,
    timestamp: Date.now(),
  };

  messages.push(newMessage);

  // Emit the new message to all connected clients
  const io = require("./socket").getIo();
  io.emit("new-message", newMessage);

  res.json({ message: newMessage });
});

module.exports = router;
