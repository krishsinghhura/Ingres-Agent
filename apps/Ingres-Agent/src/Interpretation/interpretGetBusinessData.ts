import { genAI } from "../config/Gemeni";
import { getBusinessDataPrompt } from "../prompts/getBusinessDataPrompt";
import {
  GetBusinessDataInterpretation,
  FetchGetBusinessDataInput,
  GetBusinessDataResult,
} from "../types/getBusinessDataType";
import { fetchGetBusinessData } from "../data/fetchGetBusinessData";

export async function getBusinessData(userQuery: string): Promise<GetBusinessDataResult> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const response = await model.generateContent({
      contents: [
        {
          role: "model",
          parts: [{ text: getBusinessDataPrompt }],
        },
        {
          role: "user",
          parts: [{ text: userQuery }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const outputText = response.response.text();

    let interpretation: GetBusinessDataInterpretation;
    try {
      interpretation = JSON.parse(outputText);
    } catch (err) {
      console.error("❌ Failed to parse Gemini output as JSON:", err, outputText);
      throw new Error("Gemini output could not be parsed as JSON.");
    }

    console.log("🧠 Gemini Parsed Output:", interpretation);

    const location =
      interpretation.location ||
      (interpretation as any).state ||
      (interpretation as any).place;

    const allowedDataTypes = ["admin", "basin", "both"] as const;
    const requested_data_type: ("admin" | "basin" | "both")[] =
      Array.isArray(interpretation.requested_data_type)
        ? interpretation.requested_data_type.filter((dt: string) =>
            allowedDataTypes.includes(dt as any)
          ) as ("admin" | "basin" | "both")[]
        : ["admin"];

    if (!location) {
      throw new Error("Gemini output missing 'location' field.");
    }

    const fetchInput: FetchGetBusinessDataInput = {
      location,
      requested_data_type,
      year: interpretation.year ?? null,
    };

    const apiResult = await fetchGetBusinessData(fetchInput);

    console.log(`✅ API data fetched successfully for ${location}`);

    return {
      interpretation,
      data: apiResult,
    };
  } catch (error) {
    console.error("❌ Error in getBusinessData:", error);
    throw error;
  }
}
