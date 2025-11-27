export const transformSingleValue = data => {
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
