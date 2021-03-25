import Immutable from "immutable";

declare global {
  type RelationType = "CONTAINS" | "RELEVANT"; // a contains b SUMMARIZE?
  type NodeType = "NOTE" | "TOPIC" | "URL" | "TITLE" | "QUOTE" | "VIEW";

  type Relation = {
    relationType: RelationType;
    a: string;
    b: string;
  };

  type Relations = Immutable.List<Relation>;

  type NodeView = {
    nodeID: string;
  }

  type WorkspaceColumn = {
    nodeViews: Immutable.List<NodeView>;
  }

  type Workspace = {
    columns: Immutable.List<WorkspaceColumn>;
  }

  type KnowNode = {
    id: string;
    text: string;
    nodeType: NodeType;
    relationsToObjects: Relations;
    relationsToSubjects: Relations;
  };

  type Nodes = Immutable.Map<string, KnowNode>;
  type Store = {
    nodes: Nodes;
    workspaces: Immutable.List<Workspace>;
  };

  // eslint-disable-next-line no-unused-vars
  type UpsertNodes = (nodes: Immutable.Map<string, KnowNode>) => void;
  type DeleteNodes = (toDelete: Immutable.Set<string>, toUpdate: Nodes) => void;
}
