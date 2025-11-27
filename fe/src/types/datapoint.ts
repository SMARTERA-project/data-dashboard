export interface MappedEntry {
  survey: string;
  year: string;
  region: string;
  category: string[];
  value: number;
}

export interface RawEntry {
  survey: string;
  dimensions: string[];
  value: number;
  timestamp: string;
  source: string;
  region: string;
}

export type TransformedEntry = {
  regionName: string;
  ageGroup?: string;
  gender?: string;
  year?: string; // <-- ADD THIS LINE
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  value: number;
};

export interface Datapoint {
  region: string;
  source: string;
  timestamp: string;
  survey: string;
  dimensions: string[];
  value: number;
}

export interface LabeledData {
  labels: string[];
  values: number[];
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}
