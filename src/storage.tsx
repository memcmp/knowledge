import { Storage } from "@stacks/storage";
import Immutable from "immutable";

export const TIMELINE = "TIMELINE";
export const INTERESTS = "INTERESTS";
export const STORAGE_FILE = "knowledge_v2.json";

export async function saveDataStore(
  storage: Storage,
  store: Store
): Promise<void> {
  await storage.putFile(STORAGE_FILE, JSON.stringify(store), {
    encrypt: false,
    dangerouslyIgnoreEtag: true
  });
}

const DEFAULT_STORE: Store = {
  nodes: Immutable.Map({
    [TIMELINE]: {
      id: TIMELINE,
      nodeType: "VIEW",
      text: "Timeline",
      relationsToObjects: [],
      relationsToSubjects: []
    },
    [INTERESTS]: {
      id: INTERESTS,
      nodeType: "VIEW",
      text: "My Topics",
      relationsToObjects: [],
      relationsToSubjects: []
    }
  })
};

export async function getDataStore(storage: Storage): Promise<Store> {
  try {
    const json = await storage.getFile(STORAGE_FILE, { decrypt: false });
    if (!json) {
      return DEFAULT_STORE;
    }
    const store: Store = JSON.parse(json as string) as Store;
    return {
      nodes: DEFAULT_STORE.nodes.merge(Immutable.Map(store.nodes))
    };
  } catch {
    return DEFAULT_STORE;
  }
}
