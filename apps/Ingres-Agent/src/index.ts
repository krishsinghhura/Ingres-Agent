import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { genAI } from "./config/Gemeni";
import { researchFunction } from "./tools/researchFunction";
import { INDIAN_STATES } from "./utils/stateLists";
import { SchemaType } from "@google/generative-ai"; 

const filePath = path.join(__dirname, "dummyChat.json");

function getPreviousChats() {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<
    string,
    any[]
  >;
  return Object.values(data)[0] || [];
}

function isState(location: string) {
  return INDIAN_STATES.some((s) => s.toLowerCase() === location.toLowerCase());
}

export async function handleUserQuery(userQuery: string) {
  const previousChats = getPreviousChats();

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

  if (call && call.name === "research") {
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

    console.log("💬", next.response.text());
    return next.response.text();
  } else {
    console.log("💬", result.response.text());
    return result.response.text();
  }
}

(async () => {
  await handleUserQuery("Tell me about maharastra rainfall levels");
})();
