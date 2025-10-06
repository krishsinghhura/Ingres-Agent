import axios from "axios";
import { GoogleGenAI } from "@google/genai";

// -------------------- Config --------------------
const MAP_API_URL = "https://ingres.iith.ac.in/api/gec/mapBusinessData";

// -------------------- System Prompt --------------------
const SYSTEM_PROMPT = `
You are given a large array of objects with the following structure. Example object:
{
        "locationName": "NAGOD",
        "color": null,
        "locUUID": "6867d89a-6d01-4dfe-bdec-7674156bb5b0",
        "rainfall": 1075.5,
        "recharge": {
            "agriculture": {
                "poor_quality": 0.0,
                "total": 3167.35,
                "non_command": 1874.3,
                "command": 1293.05
            },
            "rainfall": {
                "poor_quality": 0.0,
                "total": 9092.5,
                "non_command": 8933.73,
                "command": 158.77
            },
            "total": {
                "poor_quality": 0.0,
                "total": 12452.97,
                "non_command": 10982.880000000001,
                "command": 1470.0900000000001
            },
            "surface_irrigation": {
                "poor_quality": 0.0,
                "total": 1283.87,
                "non_command": 0.0,
                "command": 1283.8679999999997
            },
            "gw_irrigation": {
                "poor_quality": 0.0,
                "total": 1883.48,
                "non_command": 1874.3,
                "command": 9.18
            },
            "water_body": {
                "poor_quality": 0.0,
                "total": 18.93,
                "non_command": 18.93,
                "command": 0.0
            },
            "canal": {
                "total": 18.27,
                "command": 18.27
            },
            "artificial_structure": {
                "poor_quality": 0.0,
                "total": 155.914,
                "non_command": 155.914,
                "command": 0.0
            }
        },
        "loss": null,
        "draft": {
            "agriculture": {
                "total": 7533.9531,
                "non_command": 7497.2115,
                "command": 36.7416
            },
            "domestic": {
                "total": 582.3867,
                "non_command": 540.75261,
                "command": 41.63409
            },
            "total": {
                "total": 8125.47,
                "non_command": 8047.09,
                "command": 78.38
            },
            "industry": {
                "total": 9.125,
                "non_command": 9.125,
                "command": 0.0
            }
        },
        "currAvailabilityForAllPurposes": null,
        "stage": null,
        "category": {
            "total": "safe",
            "non_command": "semi_critical",
            "command": "safe"
        },
        "area": {
            "non_recharge_worthy": {
                "commandArea": 0.0,
                "nonCommandArea": 0.0,
                "poorQualityArea": 0.0,
                "hillyArea": 0.0,
                "forestArea": 0.0,
                "totalArea": 3500.0,
                "pavedArea": 0.0,
                "unpavedArea": 0.0
            },
            "total": {
                "commandArea": 1750.0,
                "nonCommandArea": 89750.0,
                "poorQualityArea": 0.0,
                "hillyArea": 0.0,
                "forestArea": 0.0,
                "totalArea": 95000.0,
                "pavedArea": 0.0,
                "unpavedArea": 0.0
            },
            "recharge_worthy": {
                "commandArea": 1750.0,
                "nonCommandArea": 89750.0,
                "poorQualityArea": 0.0,
                "hillyArea": 0.0,
                "forestArea": 0.0,
                "totalArea": 91500.0,
                "pavedArea": 0.0,
                "unpavedArea": 0.0
            }
        },
        "locationUUID": "6867d89a-6d01-4dfe-bdec-7674156bb5b0",
        "rechargeData": {
            "agriculture": {
                "poor_quality": 0.0,
                "total": 3167.35,
                "non_command": 1874.3,
                "command": 1293.05
            },
            "rainfall": {
                "poor_quality": 0.0,
                "total": 9092.5,
                "non_command": 8933.73,
                "command": 158.77
            },
            "total": {
                "poor_quality": 0.0,
                "total": 12452.97,
                "non_command": 10982.880000000001,
                "command": 1470.0900000000001
            },
            "surface_irrigation": {
                "poor_quality": 0.0,
                "total": 1283.87,
                "non_command": 0.0,
                "command": 1283.8679999999997
            },
            "gw_irrigation": {
                "poor_quality": 0.0,
                "total": 1883.48,
                "non_command": 1874.3,
                "command": 9.18
            },
            "water_body": {
                "poor_quality": 0.0,
                "total": 18.93,
                "non_command": 18.93,
                "command": 0.0
            },
            "canal": {
                "total": 18.27,
                "command": 18.27
            },
            "artificial_structure": {
                "poor_quality": 0.0,
                "total": 155.914,
                "non_command": 155.914,
                "command": 0.0
            }
        },
        "draftData": {
            "agriculture": {
                "total": 7533.9531,
                "non_command": 7497.2115,
                "command": 36.7416
            },
            "domestic": {
                "total": 582.3867,
                "non_command": 540.75261,
                "command": 41.63409
            },
            "total": {
                "total": 8125.47,
                "non_command": 8047.09,
                "command": 78.38
            },
            "industry": {
                "total": 9.125,
                "non_command": 9.125,
                "command": 0.0
            }
        },
        "currentAvailabilityForAllPurposes": null,
        "stageOfExtraction": null
    },

When a user query comes, return a structured description of exactly what part of the data they are asking for.
Example:
Input query: "Show me all recharge data in Nagod"
Output:
{
    "fields": ["locationName":<name of the location in query>, "rainfall", "recharge"]
}
`;

// -------------------- Types --------------------
interface GemeniResponse {
  fields: string[];
}

const ai = new GoogleGenAI({
  apiKey: "AIzaSyA592PToDB5Ni93N4O5a0wG-Ekb5ZGnsYc"
});

// -------------------- Types --------------------
interface LocationData {
  locationName: string;
  color?: string | null;
  locUUID: string;
  rainfall: number;
  recharge: Record<string, any>;
  draft: Record<string, any>;
  category: Record<string, any>;
  area: Record<string, any>;
  [key: string]: any;
}

interface GemeniResponse {
  fields: string[]; // e.g., ["locationName", "rainfall", "recharge"]
}

// -------------------- Step 1: Call Gemeni --------------------
async function callGemeni(query: string) {
  const content = `${SYSTEM_PROMPT}\n\nUser Query: ${query}`;

  // Call Gemeni using gemini-2.5-flash
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
    generation_config: { response_mime_type: "application/json" } as any
  } as any);
  console.log("Raw res:",response?.candidates?.[0]?.content?.parts);
  
  // Access the raw text safely
  
}

// Example usage
(async () => {
  const userQuery = "Show me all recharge data in Nagod";

  const prompt = SYSTEM_PROMPT + "\nUser Query: " + userQuery;

  const result = await callGemeni(prompt);
  console.log("Parsed result:", result);
})();

// -------------------- Step 2: Fetch Main API Data --------------------
async function fetchMapBusinessData(payload: any): Promise<LocationData[]> {
  const response = await axios.post(MAP_API_URL, payload);
  return response.data; // assuming response.data is an array
}

// -------------------- Step 3: Filter Data Based on Gemeni Response --------------------
function extractRelevantData(data: LocationData[], fields: string[]): any[] {
  return data.map(location => {
    const filtered: any = {};
    fields.forEach(field => {
      if (location[field] !== undefined) filtered[field] = location[field];
    });
    return filtered;
  });
}

// -------------------- Main --------------------
async function main() {
  const userQuery = "Show me all recharge data in Nagod";

  // Step 1: Gemeni understands the query
  const gemeniResult = await callGemeni(userQuery);
  console.log("Gemeni output (fields to extract):", gemeniResult);

  // // Step 2: Fetch full main API data
  // const payload = { /* API payload */ };
  // const data = await fetchMapBusinessData(payload);

  // // Step 3: Extract only the fields Gemeni wants
  // const relevantData = extractRelevantData(data, gemeniResult.fields);

  // console.log("Relevant Data for user query:", relevantData);
}

// Run main
main().catch(err => console.error(err));
