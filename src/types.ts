export type QueryMap = Record<string, string> & { readonly version: string };

export type ApolloExtractedQueriesJsonV1 = Record<
  string,
  { readonly name: string; readonly source: string }
> & { readonly version: string };

export type ApolloExtractedQueriesJsonV2 = {
  readonly version: 2;
  readonly operations: readonly {
    readonly signature: string;
    readonly document: string;
  }[];
};

export type ExtractedQueries =
  | QueryMap
  | ApolloExtractedQueriesJsonV2
  | ApolloExtractedQueriesJsonV1;
