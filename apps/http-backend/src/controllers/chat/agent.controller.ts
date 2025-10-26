import axios from "axios";
import { prisma } from "../../config/DB";
import { BASE_URL } from "../../config";
import { Request, Response } from "express";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  summary?: string;
  details?: { title: string; items: string[] }[];
}

export const chatResponseController = async (req: Request, res: Response) => {
  try {
    const { query, chatId, previousChats = [] } = req.body;
    const userId = (req as any).user?.id;

    const normalizedChats: ChatMessage[] = previousChats.map((msg: any) => {
      let content = msg.content ?? "";

      if (msg.role === "assistant" && !content) {
        const summaryText = msg.summary ?? "";
        const detailsText = msg.details
          ? msg.details
              .map((d: any) => `${d.title}: ${d.items.join(", ")}`)
              .join("\n")
          : "";
        content = [summaryText, detailsText].filter(Boolean).join("\n");
      }

      if (!content.trim()) {
        content = "(no content)";
      }

      return { role: msg.role, content };
    });
    console.log(normalizedChats);
    
    const response = await axios.post(`${BASE_URL}`, {
      query,
      previousChats: normalizedChats,
    });

    const botResponse = response.data?.reply;

    if (!botResponse || typeof botResponse !== "string") {
      console.error("Invalid bot response:", response.data);
      return res
        .status(502)
        .json({
          error: "No valid response from AI agent",
          data: response.data,
        });
    }

    let chat;

    // 3️⃣ Save messages
    if (chatId) {
      chat = await prisma.chat.update({
        where: { id: chatId },
        data: {
          messages: {
            create: [
              { content: query, sender: "USER" },
              { content: botResponse, sender: "BOT" },
            ],
          },
        },
        include: { messages: true },
      });
    } else {
      chat = await prisma.chat.create({
        data: {
          title: query,
          userId,
          messages: {
            create: [
              { content: query, sender: "USER" },
              { content: botResponse, sender: "BOT" },
            ],
          },
        },
        include: { messages: true },
      });
    }

    return res.json({ success: true, chat });
  } catch (error: any) {
    console.error("Error in chatResponseController:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};
