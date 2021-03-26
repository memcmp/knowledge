import { UserSession, UserData } from "@stacks/connect";
import { Storage } from "@stacks/storage";
import { useQuery, UseQueryResult } from "react-query";

import { signInUser } from "./auth";

import { getDataStore } from "./storage";

type UseQueryProps = {
  readonly userSession: UserSession;
  storage: Storage;
};

type QueryResult = {
  userQuery: UseQueryResult<UserData | null>;
  storageQuery: UseQueryResult<Store>;
};

export function useQueries({
  userSession,
  storage
}: UseQueryProps): QueryResult {
  const userQuery = useQuery({
    queryKey: "user",
    queryFn: () => signInUser(userSession)
  });
  const storageQuery = useQuery({
    queryKey: "store",
    queryFn: async () => getDataStore(storage),
    enabled: userQuery.isSuccess,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
  return {
    userQuery,
    storageQuery
  };
}
