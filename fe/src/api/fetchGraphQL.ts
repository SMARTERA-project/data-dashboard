import axiosGraphQLClient from './axiosClient';
import type { DocumentNode } from 'graphql';
import { print } from 'graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export default async function fetchGraphQL<
  T = any,
  V extends Record<string, any> = Record<string, any>,
>(
  query: string | DocumentNode,
  variables?: V,
  operationName?: string
): Promise<T> {
  const textQuery = typeof query === 'string' ? query : print(query);

  const payload: Record<string, any> = {
    query: textQuery,
    variables,
  };
  if (operationName) {
    payload.operationName = operationName;
  }

  const { data: resp } = await axiosGraphQLClient.post<GraphQLResponse<T>>(
    '',
    payload
  );

  if (resp.errors && resp.errors.length) {
    throw new Error(resp.errors.map(e => e.message).join('\n'));
  }
  if (resp.data === undefined) {
    throw new Error('No data returned from GraphQL');
  }

  return resp.data;
}
