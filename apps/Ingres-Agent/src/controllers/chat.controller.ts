import { genAI } from "../config/Gemeni";
import { researchFunction } from "../tools/researchFunction";
import { INDIAN_STATES } from "../utils/stateLists";
import { SchemaType, Part } from "@google/generative-ai";
import { Request, Response } from "express";

function isState(location: string) {
  return INDIAN_STATES.some((s) => s.toLowerCase() === location.toLowerCase());
}

export async function handleUserQuery(req: Request, res: Response) {
  try {
    const userQuery = (req.body.query || "(empty query)").trim();

    type Chat = { role: string; message: string };
    const previousChats: Chat[] = req.body?.previousChats ?? [];

    // 1️⃣ Normalize previous chats for Gemini
    const normalizedChats = previousChats
      .map((m: Chat) => {
        const content = (m.message || "(no content)").trim();
        return {
          role: m.role === "assistant" ? "model" : m.role,
          parts: [{ text: content }] as Part[],
        };
      })
      .filter((m) => m.parts?.[0]?.text);

    // 2️⃣ Initialize Gemini model
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

    // 3️⃣ Start the chat with normalized history
    const chat = model.startChat({ history: normalizedChats });

    // 4️⃣ Send the user query
    const result = await chat.sendMessage(userQuery);

    // 5️⃣ Check if the model wants to call the research function
    const call = result.response.functionCalls()?.[0];

    const queryMatchesPrevious = previousChats.some(
      (chat) =>
        typeof chat.message === "string" &&
        chat.message.toLowerCase().includes(userQuery.toLowerCase())
    );

    if (!queryMatchesPrevious && call && call.name === "research") {
      // Parse the function call arguments safely
      let args: any = {};
      if (typeof call.args === "string") {
        try {
          args = JSON.parse(call.args);
        } catch {
          args = {};
        }
      } else {
        args = call.args;
      }

      const loc = typeof args.location === "string" ? args.location : "";
      const st =
        typeof args.state === "boolean"
          ? args.state
          : loc
            ? isState(loc)
            : false;

      // 6️⃣ Run the research function
      // Run the research function
      const data = await researchFunction(st, loc, previousChats, userQuery);

      // Send the research result safely as a string
      const next = await chat.sendMessage(JSON.stringify(data, null, 2));

      return res.json({ reply: next.response.text() || "" });
    }

    // 8️⃣ Otherwise, return the normal chat response
    return res.json({ reply: result.response.text() || "" });
  } catch (error: any) {
    console.error("Error in handleUserQuery:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
}
