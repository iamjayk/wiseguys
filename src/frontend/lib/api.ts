const graphqlUri =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ?? "http://localhost:5000/graphql";

export const API_BASE =
  graphqlUri.replace(/\/graphql\/?$/, "") || "http://localhost:5000";
