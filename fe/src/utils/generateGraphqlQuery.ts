import { GraphQLQueryParams } from '@/types/queryParams';

export function generateGraphQLQuery({
  survey,
  sortBy = 'value',
  sortOrder = 'desc',
  limit = 100,
  dimensions = [],
  exclude = [],
}: GraphQLQueryParams): string {
  const filters =
    dimensions.length > 0 ? `["${dimensions.join('", "')}"]` : '[]';

  const query = `
      query {
        datapoints(
          survey: "${survey}",
          sortBy: "${sortBy}",
          sortOrder: "${sortOrder}",
          limit: ${limit},
          dimensions: ${filters},
          exclude: ${exclude.length > 0 ? `["${exclude.join('", "')}"]` : '[]'}

        ) {
            region
            source
            timestamp
            survey
            dimensions
            value
        }
      }
    `;

  return query.trim();
}
