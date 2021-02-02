import Immutable from "immutable";

declare global {
  type RelationType = "CONTAINS" | "RELEVANT"; // a contains b SUMMARIZE?
  type NodeType =
    | "NOTE"
    | "TOPIC"
    | "ARGUMENT"
    | "QUESTION" // remove
    | "URL"
    | "TITLE"
    | "QUOTE"
    | "VIEW";

  type Relation = {
    relationType: RelationType;
    a: string;
    b: string;
  };

  type Relations = Array<Relation>;
  type Nodes = Immutable.Map<string, KnowNode>;

  type KnowNode = {
    id: string;
    text: string;
    nodeType: NodeType;
    childRelations: Relations;
    parentRelations: Relations;
  };

  type Store = {
    nodes: Nodes;
  };

  type AddRelations = (nodes: Immutable.Map<string, KnowNode>) => void;
}

export {};
