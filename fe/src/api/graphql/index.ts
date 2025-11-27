import fetchGraphQL from '@api/fetchGraphQL';
import * as General from '@api/graphql/queries/general';
import * as Services from '@api/graphql/queries/services';
import * as EnablingFactors from '@api/graphql/queries/enablingFactors';
import * as Economy from '@api/graphql/queries/economy';
import * as Environment from '@api/graphql/queries/environment';
import * as Governance from '@api/graphql/queries/governance';
import * as Mobility from '@api/graphql/queries/mobility';
import * as Analysis from '@api/graphql/queries/analysis';

export const Queries = {
  ...General,
  ...Services,
  ...EnablingFactors,
  ...Economy,
  ...Environment,
  ...Governance,
  ...Mobility,
  ...Analysis,
} as const;

export async function fetchDatapoints<K extends keyof typeof Queries>(
  key: K,
  variables?: Record<string, any>
): Promise<any> {
  const doc = Queries[key];
  const resp = await fetchGraphQL<any>(doc, variables);

  if ('datapoints' in resp) return resp.datapoints;
  return resp;
}
