import { getBusinessData } from "../Interpretation/interpretGetBusinessData"; 
import { mapBusinessData } from "../Interpretation/interpretMapBusinessData"; 

export async function researchFunction(
  state: boolean,
  location: string,
  previousChats: any[],
  userQuery: string
) {
  console.log(`🔍 Calling researchFunction for ${location} | state: ${state}`);

  try {
    if (state) {
      const result = await getBusinessData(userQuery);
      return {
        location,
        state,
        dataSource: "Gemini getBusinessData",
        result,
      };
    } else {
      // ✅ Placeholder until you have mapBusinessData
      const result = await mapBusinessData(userQuery);
      // const result = { note: "mapBusinessData not yet implemented" };
      return {
        location,
        state,
        dataSource: "Map Business Data (placeholder)",
        result,
      };
    }
  } catch (error) {
    console.error("❌ Error in researchFunction:", error);
    return {
      location,
      state,
      error: true,
      message: (error as Error).message || "Unknown error in researchFunction",
    };
  }
}
