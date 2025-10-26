import {getUserChatsController} from "../controllers/chat/getUserChat.Controller"
import express from "express";
export const chatRouter=express.Router();
import {verifyToken} from "../middlewares/auth.middleware"
import {chatResponseController} from "../controllers/chat/agent.controller"
import {getChatMessagesController} from "../controllers/chat/getChatMessages.controller"

chatRouter.get("/all",verifyToken,getUserChatsController);

chatRouter.post("/chat-with-agent",verifyToken,chatResponseController);

chatRouter.get("/:chatId/messages", verifyToken, getChatMessagesController);