export type ExternalSearchUrlStrategy = 'query-param' | 'path-segment';

export interface ExternalSearchProvider {
  id: string;
  name: string;
  baseUrl: string;
  queryParam?: string;
  urlStrategy?: ExternalSearchUrlStrategy;
  icon: string;
}
