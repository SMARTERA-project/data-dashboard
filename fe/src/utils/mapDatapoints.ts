import { RawEntry, MappedEntry } from '@/types/datapoint';

export function mapDatapoints(data: RawEntry[]): MappedEntry[] {
  return data.map(
    ({ survey, dimensions, value, timestamp, source, region }) => {
      const len = dimensions.length;
      return {
        survey,
        year: dimensions[len - 1],
        region: dimensions[len - 2],
        category: dimensions.slice(0, len - 2),
        value,
        timestamp,
        source,
        nuts: region,
      };
    }
  );
}
