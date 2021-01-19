import Immutable from "immutable";

declare global {
  type RelationType = "CONTAINS" | "RELEVANT"; // a contains b
  type NodeType =
    | "URL"
    | "TITLE"
    | "ISBN"
    | "ISSN"
    | "CLAIM"
    | "NOTE"
    | "TOPIC"
    | "EVENT"
    | "LOCATION"
    | "PERSON"
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
  };

  type Store = {
    relations: Relations;
    nodes: Immutable.Map<string, KnowNode>;
  };

  type AddRelations = (bucket: Store) => void;
}

export {};
