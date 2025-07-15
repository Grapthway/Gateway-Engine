// useGraphQL.ts
import { api } from "@/src/services/api";
import { useEffect, useCallback } from "react"; // <-- Import useCallback
import { useQuery } from "./useQuery";
import { useMutation } from "./useMutation";

export function useGraphQLQuery<
  TData,
  TVariables extends Record<string, any> | undefined = undefined
>(
  query: string,
  variables?: TVariables,
  lazy = false
) {
  // Wrap the runner function in useCallback.
  // It will only be re-created if 'query' or 'variables' change.
  const runner = useCallback(() =>
    api.graphqlRequest<{ [K in keyof TData]: TData[K] }>(
      query,
      variables as Record<string, any> | undefined
    ), [query, variables]); // <-- Dependency array for useCallback

  // Now, the 'runner' passed to useQuery is stable.
  const { fetch, ...rest } = useQuery<TData>(runner);

  useEffect(() => {
    if (!lazy) {
      fetch();
    }
  }, [fetch, lazy]);

  return {
    ...rest,
    refetch: fetch,
  };
}

// ... (useGraphQLMutation can remain the same) ...

// ──────────────────────────────────────────────────────────────
// MUTATION HOOK
// ──────────────────────────────────────────────────────────────
// And here, TVariables must at least be an object:
export function useGraphQLMutation<
  TData,
  TVariables extends Record<string, any> = Record<string, any>
>(mutation: string) {
  const fn = (vars: TVariables) =>
    api.graphqlRequest<{ [K in keyof TData]: TData[K] }>(
      mutation,
      vars
    );

  return useMutation<TVariables, TData>(fn);
}