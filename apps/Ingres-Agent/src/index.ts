import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { router } from './routes/chat.route';
import express from "express";
const PORT=9000;

const app=express();
app.use(express.json());

app.use("/agent",router);

app.listen(PORT,()=>{
  console.log("Agent running on port ",PORT);
})