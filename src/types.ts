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

  type DisplayConnections =
    | "RELEVANT_SUBJECTS"
    | "RELEVANT_OBJECTS"
    | "CONTAINS_OBJECTS"
    | "NONE";

  type NodeView = {
    nodeID: string;
    displayConnections: DisplayConnections;
  };

  type WorkspaceColumn = {
    nodeViews: Immutable.List<NodeView>;
    columnID: string;
  };

  type Workspace = {
    columns: Immutable.OrderedMap<string, WorkspaceColumn>;
  };

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
  type UpdateWorkspace = (workspace: Workspace, nodes: Nodes) => void;
}
