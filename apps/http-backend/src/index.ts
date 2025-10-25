import express from "express";
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app=express();
app.use(express.json());
const PORT=9001;

app.listen(PORT,()=>{
    console.log("http-server running on ",PORT);
})