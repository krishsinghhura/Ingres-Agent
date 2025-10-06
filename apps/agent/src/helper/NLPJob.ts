import { genAI } from "../config/Gemeni";

const SYSTEM_PROMPT = `
You are a chatbot for INGRES.

Below is the user query in structured data (Gemini JSON interpretation) and the original matched location data.

Your task is to act as a Natural Language Processor:

1. Understand exactly what the user is asking from the data.
2. Analyze if any other keys from the data are related or influence the query.
3. Provide a clear, structured response describing the requested information and any relevant relationships.
4. Additionally, provide a **layman-friendly explanation** of the analysis as if you are chatting with a user. 
   - Explain in simple terms what the numbers or trends mean.
   - Make it conversational and easy to understand.
5. Optionally, summarize differences, trends, or comparisons if relevant.

Return a JSON object with two keys:
{
  "analysis": "<structured or detailed explanation of what the data shows>",
  "explanation": "<chatbot-style layman-friendly explanation>"
}
`;


export async function NLPJob(interpretation: any, fullData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
SYSTEM PROMPT:
${SYSTEM_PROMPT}

Structured User Query:
${JSON.stringify(interpretation, null, 2)}

Matched Location Data:
${JSON.stringify(fullData, null, 2)}
`;

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json", 
      },
    });

    const outputText = response.response.text();
    let parsedOutput: any;

    try {
      parsedOutput = JSON.parse(outputText);
    } catch {
      parsedOutput = outputText; 
    }

    return parsedOutput;
  } catch (err: any) {
    console.error(" NLPJob Error:", err.message);
    return null;
  }
}
