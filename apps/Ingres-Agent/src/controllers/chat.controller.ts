import { genAI } from "../config/Gemeni";
import { researchFunction } from "../tools/researchFunction";
import { INDIAN_STATES } from "../utils/stateLists";
import { SchemaType } from "@google/generative-ai";
import express, { Request, Response } from "express";

function isState(location: string) {
  return INDIAN_STATES.some((s) => s.toLowerCase() === location.toLowerCase());
}

export async function handleUserQuery(req: Request, res: Response) {
  const userQuery = req.body.query;

  type Chat = { role: string; message: string };
  const previousChats: Chat[] = req.body?.previousChats ?? [];

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [
      {
        functionDeclarations: [
          {
            name: "research",
            description:
              "Do research for a specific location if a new location is mentioned.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                location: { type: SchemaType.STRING },
                state: { type: SchemaType.BOOLEAN },
                previousChats: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
                userQuery: { type: SchemaType.STRING },
              },
            },
          },
        ],
      },
    ],
  });

  const chat = model.startChat({
    history: previousChats.map((m: any) => ({
      role: m.role === "assistant" ? "model" : m.role,
      parts: [{ text: m.message }],
    })),
  });

  const result = await chat.sendMessage(userQuery);
  const call = result.response.functionCalls()?.[0];

  // Step 1: Check if the current query can be answered from previous chats
  const queryMatchesPrevious = previousChats.some((chat: any) =>
    chat.message.toLowerCase().includes(userQuery.toLowerCase())
  );

  if (!queryMatchesPrevious && call && call.name === "research") {
    // Step 2: New query, needs research
    let args: any = {};
    if (typeof call.args === "string") {
      try {
        args = JSON.parse(call.args);
      } catch {
        args = {};
      }
    } else {
      args = call.args as any;
    }

    const loc = typeof args.location === "string" ? args.location : "";
    const st =
      typeof args.state === "boolean" ? args.state : loc ? isState(loc) : false;

    const data = await researchFunction(st, loc, previousChats, userQuery);

    const next = await chat.sendMessage([
      {
        functionResponse: {
          name: "research",
          response: { name: "research", content: data },
        },
      },
    ]);

    const response = { reply: next.response.text() };
    console.log("💬 [new data]", next.response.text());
    return res.json(response);
  }
  console.log("💬 [previous chat]", result.response.text());
  return res.json({ reply: result.response.text() });
}
