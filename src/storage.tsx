import { Storage } from "@stacks/storage";
import Immutable from "immutable";

import { extractPlainText } from "./Searchbox";

export const TIMELINE = "TIMELINE";
export const INTERESTS = "INTERESTS";
export const STORAGE_FILE = "knowledge_v2.json";

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function saveDataStore(
  storage: Storage,
  store: Store
): Promise<void> {
  await storage.putFile(STORAGE_FILE, JSON.stringify(store), {
    encrypt: false,
    dangerouslyIgnoreEtag: true
  });
}
/* eslint-enable @typescript-eslint/no-unused-vars */

const EMPTY_RELATIONS = Immutable.List<Relation>();

export const DEFAULT_STORE: Store = {
  nodes: Immutable.Map({
    [TIMELINE]: {
      id: TIMELINE,
      nodeType: "VIEW",
      text: "Timeline",
      relationsToObjects: EMPTY_RELATIONS,
      relationsToSubjects: EMPTY_RELATIONS
    },
    [INTERESTS]: {
      id: INTERESTS,
      nodeType: "VIEW",
      text: "My Topics",
      relationsToObjects: EMPTY_RELATIONS,
      relationsToSubjects: EMPTY_RELATIONS
    }
  }),
  workspaces: Immutable.List<Workspace>()
};

type RawNode = {
  id: string;
  nodeType: NodeType;
  text: string;
  relationsToObjects: Array<Relation>;
  relationsToSubjects: Array<Relation>;
};

type RawStore = {
  nodes: { [key: string]: RawNode };
  workspaces: undefined | Array<Workspace>;
};

export async function getDataStore(storage: Storage): Promise<Store> {
  try {
    const json = await storage.getFile(STORAGE_FILE, { decrypt: false });
    if (!json) {
      return DEFAULT_STORE;
    }
    const rawStore: RawStore = JSON.parse(json as string) as RawStore;
    const nodes = Immutable.Map(rawStore.nodes).map(node => {
      return {
        ...node,
        text: extractPlainText((node as unknown) as KnowNode),
        relationsToObjects: Immutable.List(node.relationsToObjects),
        relationsToSubjects: Immutable.List(node.relationsToSubjects)
      };
    });
    const store: Store = {
      nodes,
      workspaces:
        rawStore.workspaces === undefined
          ? Immutable.List<Workspace>()
          : Immutable.List<Workspace>(
              rawStore.workspaces.map(rawWorkspace => {
                return {
                  columns: Immutable.OrderedMap(rawWorkspace.columns).map(
                    rawColumn => {
                      return {
                        columnID: rawColumn.columnID,
                        nodeViews: Immutable.List(rawColumn.nodeViews)
                      };
                    }
                  )
                };
              })
            )
    };
    return {
      nodes: DEFAULT_STORE.nodes.merge(Immutable.Map(store.nodes)),
      workspaces: store.workspaces
    };
  } catch (e) {
    return DEFAULT_STORE;
  }
}
