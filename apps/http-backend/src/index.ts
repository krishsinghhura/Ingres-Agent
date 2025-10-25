import express from "express";

const app=express();
app.use(express.json());
const PORT=9001;

app.listen(PORT,()=>{
    console.log("http-server running on ",PORT);
})