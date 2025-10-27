import { genAI } from "../config/Gemeni";
import { researchFunction } from "../tools/researchFunction";
import { INDIAN_STATES } from "../utils/stateLists";
import { SchemaType, Part } from "@google/generative-ai";
import { Request, Response } from "express";

/** ✅ Utility: check if given location is an Indian state */
function isState(location: string): boolean {
  return INDIAN_STATES.some((s) => s.toLowerCase() === location.toLowerCase());
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function handleUserQuery(req: Request, res: Response) {
  try {
    console.log("📥 Incoming body:", JSON.stringify(req.body, null, 2));

    const userQuery = String(req.body.query || "").trim() || "(empty query)";
    const previousChats: ChatMessage[] = Array.isArray(req.body?.previousChats)
      ? req.body.previousChats
      : [];

    /** 🧹 1️⃣ Normalize and clean previous chats for Gemini */
    const normalizedChats = previousChats
      .filter((m): m is ChatMessage => !!m && !!m.content?.trim())
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content.trim() }] as Part[],
      }))
      .filter((m) => {
        const text = m.parts?.[0]?.text ?? "";
        return (
          text &&
          !/(no access|previous conversation|cannot fulfill|don’t have)/i.test(text)
        );
      });

    console.log("🧠 Normalized chat history:");
    console.dir(normalizedChats, { depth: null });

    /** 🤖 2️⃣ Initialize Gemini model with function calling */
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
You are an intelligent agent that always has full access to the chat history.
Use all prior messages to maintain context and continuity.
Never say "I don't have access to previous conversations."
When the user asks follow-up questions, infer missing details from history.
If you can answer without research, do so confidently.
Only call "research" when a new location is introduced.
`,
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

    /** 💬 3️⃣ Start chat with context */
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "Here are all past messages in this chat. Use them to answer naturally. " +
                "You have access to full conversation memory.",
            },
          ],
        },
        ...normalizedChats,
      ],
    });

    /** 📨 4️⃣ Send user query to Gemini */
    const result = await chat.sendMessage(userQuery);
    const responseText = result.response.text() || "";
    const call = result.response.functionCalls()?.[0];

    /** 🚫 5️⃣ Smarter duplicate detection — skip only after first query */
    const userMessages = previousChats.filter((c) => c.role === "user");
    const lastUserMsg = userMessages.at(-1)?.content?.trim()?.toLowerCase();

    const queryMatchesPrevious =
      userMessages.length > 1 && lastUserMsg === userQuery.toLowerCase();

    if (queryMatchesPrevious) {
      console.log("🟡 Skipping redundant research (duplicate query detected)");
    }

    /** 🧩 6️⃣ Handle Gemini function call (research) */
    if (!queryMatchesPrevious && call?.name === "research") {
      console.log("🔍 Gemini requested research with args:", call.args);

      let args: Record<string, any> = {};
      try {
        args =
          typeof call.args === "string"
            ? JSON.parse(call.args)
            : call.args || {};
      } catch (err) {
        console.warn("⚠️ Failed to parse function args:", err);
      }

      const loc =
        typeof args.location === "string" && args.location.trim()
          ? args.location
          : userQuery;

      const st =
        typeof args.state === "boolean"
          ? args.state
          : loc
          ? isState(loc)
          : false;

      /** 🧪 Run the research function */
      const data = await researchFunction(st, loc, previousChats, userQuery);

      /** 🧾 7️⃣ Feed the research results back into Gemini */
      const next = await chat.sendMessage(JSON.stringify(data, null, 2));
      const reply = next.response.text() || "";

      console.log("✅ Final Gemini reply after research:", reply);
      return res.json({ reply });
    }

    /** 🧾 8️⃣ Return Gemini’s normal response */
    console.log("✅ Gemini direct reply:", responseText);
    return res.json({ reply: responseText });
  } catch (error: any) {
    console.error("❌ Error in handleUserQuery:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
