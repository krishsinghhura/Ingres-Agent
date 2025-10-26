import { Request, Response } from "express";
import { prisma } from "../../config/DB";

export const getChatMessagesController = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: { id: true },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found or unauthorized" });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" }, 
      select: {
        id: true,
        content: true,
        sender: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "Messages fetched successfully",
      chatId,
      messages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
