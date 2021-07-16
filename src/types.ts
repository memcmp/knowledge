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
    | "CONTAINS_OBJECTS";

  type NodeView = {
    nodeID: string;
    displayConnections: DisplayConnections;
    expanded: boolean;
  };

  type WorkspaceColumn = {
    nodeViews: Immutable.List<NodeView>;
    columnID: string;
  };

  type Workspace = {
    index: number;
    title: string;
    columns: Immutable.OrderedMap<string, WorkspaceColumn>;
    color: string;
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
    activeWorkspace: number;
  };

  // eslint-disable-next-line no-unused-vars
  type UpsertNodes = (nodes: Immutable.Map<string, KnowNode>) => void;
  type DeleteNodes = (toDelete: Immutable.Set<string>, toUpdate: Nodes) => void;
  type UpdateWorkspace = (workspace: Workspace, nodes: Nodes) => void;
  type AddWorkspace = (title: string, color: string) => void;
  type SelectWorkspace = (index: number) => void;
  type DeleteWorkspace = (index: number) => void;
}
