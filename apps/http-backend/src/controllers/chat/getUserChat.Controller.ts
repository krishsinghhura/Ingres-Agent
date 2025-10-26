import { Request, Response } from "express";
import { prisma } from "../../config/DB"; // adjust import if needed
import { Chat,Message } from "@prisma/client";

export const getUserChatsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Pagination query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Fetch chats for the user with pagination
    const chats: Chat[] = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        userId: true,    
        createdAt: true,
        updatedAt: true,
      },
    });

    // Initialize latestChatMessages with correct type
    let latestChatMessages: Message[] = [];

    if (chats.length > 0 && chats[0]?.id) {
      const latestChatId = chats[0].id;

      latestChatMessages = await prisma.message.findMany({
        where: { chatId: latestChatId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          content: true,
          sender: true,
          createdAt: true,
          chatId: true, 
        },
      });

      // Reverse messages to show oldest → newest
      latestChatMessages = latestChatMessages.reverse();
    }

    return res.status(200).json({
      message: "Chats fetched successfully",
      chats,
      latestChatMessages,
      page,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
