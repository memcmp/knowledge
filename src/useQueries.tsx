import { UserSession, UserData } from "@stacks/connect";
import { Storage } from "@stacks/storage";
import { useQuery, UseQueryResult } from "react-query";

import { signInUser } from "./auth";

import { getDataStore } from "./storage";

type UseQueryProps = {
  userSession: UserSession;
};

type QueryResult = {
  userQuery: UseQueryResult<UserData | null>;
  storageQuery: UseQueryResult<Store>;
};

export function useQueries({ userSession }: UseQueryProps): QueryResult {
  const userQuery = useQuery({
    queryKey: "user",
    queryFn: () => signInUser(userSession)
  });
  const storageQuery = useQuery({
    queryKey: "store",
    queryFn: async () => getDataStore(new Storage({ userSession })),
    enabled: userQuery.isSuccess
  });
  return {
    userQuery,
    storageQuery
  };
}
