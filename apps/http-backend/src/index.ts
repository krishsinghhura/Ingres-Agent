import express from "express";
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import Authrouter from "./routes/auth.route";
import { chatRouter } from "./routes/chat.route";
import cors from "cors";

const app=express();

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, 
}));

app.use(express.json());
const PORT=9001;

app.use("/api/auth",Authrouter);
app.use("/api/chat",chatRouter);

app.listen(PORT,()=>{
    console.log("http-server running on ",PORT);
})