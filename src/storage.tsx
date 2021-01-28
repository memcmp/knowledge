import { Storage } from "@stacks/storage";
import Immutable from "immutable";

export const TIMELINE = "TIMELINE";
export const STORAGE_FILE = "knowledge_v1.json";

export async function saveDataStore(
  storage: Storage,
  store: Store
): Promise<void> {
  await storage.putFile(STORAGE_FILE, JSON.stringify(store), {
    encrypt: false,
    dangerouslyIgnoreEtag: true
  });
}

export async function getDataStore(storage: Storage): Promise<Store> {
  try {
    const json = await storage.getFile(STORAGE_FILE, { decrypt: false });
    if (!json) {
      return {
        nodes: Immutable.Map({
          [TIMELINE]: {
            id: TIMELINE,
            nodeType: "VIEW",
            text: "Timeline",
            parentRelations: [],
            childRelations: []
          }
        })
      };
    }
    const store = JSON.parse(json as string);
    return {
      nodes: Immutable.Map(store.nodes)
    };
  } catch {
    console.log("File does not exist");
    return {
      nodes: Immutable.Map({
        [TIMELINE]: {
          id: TIMELINE,
          nodeType: "VIEW",
          text: "Timeline",
          parentRelations: [],
          childRelations: []
        }
      })
    };
  }
}
