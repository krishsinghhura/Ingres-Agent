import axios from "axios";

interface GeminiOutput {
  location: string;
  requested_data_type: string[]; 
  year: string | null;
}

export async function fetchGetBusinessData(geminiOutput: GeminiOutput) {
  const { location, requested_data_type, year } = geminiOutput;

  // Determine the view type (admin/basin)
  const viewType = requested_data_type?.[0]?.toLowerCase() || "admin";

  // Determine the year string
  const currentYear = new Date().getFullYear();
  const yearString = year
    ? `${year}-${parseInt(year) + 1}`
    : `${currentYear - 1}-${currentYear}`;

  // Base payload
  const payload = {
    parentLocName: "INDIA",
    locname: "INDIA",
    loctype: "COUNTRY",
    view: viewType,
    locuuid: "ffce954d-24e1-494b-ba7e-0931d8ad6085",
    year: yearString,
    computationType: "normal",
    component: "recharge",
    period: "annual",
    category: "safe",
    mapOnClickParams: "false",
    verificationStatus: 1,
    approvalLevel: 1,
    parentuuid: "ffce954d-24e1-494b-ba7e-0931d8ad6085",
    stateuuid: null,
  };

  try {
    console.log(`📡 Fetching ${viewType.toUpperCase()} data for ${location} (${yearString})...`);

    const response = await axios.post(
      "https://ingres.iith.ac.in/api/gec/getBusinessDataForUserOpen",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data;
    const match = data.find(
      (item: any) =>
        item.locationName?.toLowerCase() === location.toLowerCase()
    );

    if (!match) {
      console.warn(`⚠️ No matching location found for "${location}"`);
      return { message: `No data found for ${location}`, data: null };
    }

    return match;

  } catch (error: any) {
    console.error("❌ Error fetching business data:", error.message);
    throw new Error("Failed to fetch business data from INGRES API.");
  }
}
