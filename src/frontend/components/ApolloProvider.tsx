"use client";

import { ApolloProvider as ApolloProviderClient } from "@apollo/client";
import { makeApolloClient } from "@/lib/apollo-client";

const client = makeApolloClient();

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProviderClient client={client}>{children}</ApolloProviderClient>
  );
}
