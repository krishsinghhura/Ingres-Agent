export interface GetBusinessDataInterpretation {
  location: string; 
  intent: string; 
  requested_data_type: ("admin" | "basin" | "both")[]; 
  requested_fields: string[]; 
  related_fields: string[]; 
  year: string | null; 
  notes: string | null; 
}

export interface FetchGetBusinessDataInput {
  location: string;
  requested_data_type: ("admin" | "basin" | "both")[];
  year: string | null;
}

export interface GetBusinessDataResult {
  interpretation: GetBusinessDataInterpretation;
  data: unknown; 
}
