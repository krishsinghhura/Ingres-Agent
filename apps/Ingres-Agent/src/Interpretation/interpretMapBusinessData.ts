import dotenv from "dotenv";
dotenv.config();
import { genAI } from "../config/Gemeni";
import { mapBusinessDataPrompt } from "../prompts/mapBusinessDataPrompt";
import { fetchMapBusinessData } from "../data/fetchMapBusinessData";

export async function mapBusinessData(userQuery: string) {
  const SYSTEM_PROMPT = mapBusinessDataPrompt;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Hitting for INTERPRET");

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
    console.log("Interpretation Response:", textResponse);

    let parsedInterpretation;
    try {
      parsedInterpretation = JSON.parse(textResponse);
    } catch (err) {
      console.error("Failed to parse model output:", textResponse);
      return;
    }
    if (!parsedInterpretation.location) {
      console.warn("Location is null, returning message directly");
      console.log("Message:", parsedInterpretation.message);
      return parsedInterpretation.message;
    }

    console.log("Hitting for mapBusinessData");
    const userResponse = await fetchMapBusinessData(parsedInterpretation);
    return userResponse;

  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
