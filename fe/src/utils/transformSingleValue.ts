export const transformSingleValue = (
  data: any[]
): {
  values: number[];
  region: string;
  source: string;
  survey: string;
  timestamp: string;
} | null => {
  const item = data[0];
  if (!item) return null;

  return {
    values: [item.value],
    region: item.region,
    source: item.source,
    survey: item.survey,
    timestamp: item.timestamp,
  };
};
