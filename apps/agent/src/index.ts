import dotenv from "dotenv";
dotenv.config();
import { genAI } from "./config/Gemeni";
import { INTERPRET_SYSTEM_PROMPT } from "./prompts/interpretAdminQuery";
import { callMapBusinessData } from "./admin/getAdminData";


async function interpretUserQuery(userQuery: string) {
  const SYSTEM_PROMPT = INTERPRET_SYSTEM_PROMPT;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("hitting for INTERPRET");
    
    const interpretation = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}

User Query: "${userQuery}"

Return only the JSON response as per the format.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const textResponse = interpretation.response.text();

    let parsedInterpretation;
    try {
      parsedInterpretation = JSON.parse(textResponse);
    } catch (err) {
      console.error("Failed to parse model output:", textResponse);
      return;
    }
    console.log("hitting for mapBusinessData");
    const userResponse = await callMapBusinessData(parsedInterpretation);
    console.log("Final Data:", userResponse);
  } catch (err: any) {
    console.error(" Error:", err.message);
  }
}

(async () => {
  const query =
    "tell me what is agricultural difference of draft and domestic difference of recharge of WAIDHAN";
  await interpretUserQuery(query);
})();
