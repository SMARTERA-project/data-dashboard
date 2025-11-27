export interface GraphQLQueryParams {
  survey: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  dimensions?: string[];
  exclude?: string[];
}
