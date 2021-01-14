declare global {
  type RelationType = "CONTAINS"; // a contains b
  type NodeType =
    | "URL"
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
    a: KnowNode;
    b: KnowNode;
  };

  type Relations = Array<Relation>;

  type KnowNode = {
    text: string;
    nodeType: NodeType;
  };
}

export {};
