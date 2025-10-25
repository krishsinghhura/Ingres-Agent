import express from "express";
export const router=express.Router();
import {handleUserQuery} from "../controllers/chat.controller";

router.post("/chat",handleUserQuery);