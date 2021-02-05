import { v4 } from "uuid";

export function connectRelevantNodes(
  subjectID: string,
  objectID: string,
  nodes: Nodes
): Nodes {
  const objectNode = nodes.get(objectID);
  const subjectNode = nodes.get(subjectID);
  if (!objectNode) {
    throw new Error("Can't find childNode with ID" + objectID);
  }
  if (!subjectNode) {
    throw new Error("Can't find parentNode with ID" + objectID);
  }
  const relation: Relation = {
    relationType: "RELEVANT",
    a: subjectNode.id,
    b: objectNode.id
  };
  // check if the relationship doesn't exist yet
  if (
    subjectNode.relationsToSubjects.filter(
      rel =>
        rel.relationType === relation.relationType &&
        rel.a === relation.a &&
        rel.b === relation.b
    ).length > 0
  ) {
    return nodes;
  }

  const updatedObject = {
    ...objectNode,
    relationsToSubjects: [...objectNode.relationsToSubjects, relation]
  };
  const updatedSubject = {
    ...subjectNode,
    relationsToObjects: [...subjectNode.relationsToObjects, relation]
  };
  return nodes.set(objectID, updatedObject).set(subjectID, updatedSubject);
}

export function connectContainingNodes(
  subjectID: string,
  objectID: string,
  nodes: Nodes
): Nodes {
  const objectNode = nodes.get(objectID);
  const subjectNode = nodes.get(subjectID);
  if (!objectNode) {
    throw new Error("Can't find childNode with ID" + objectID);
  }
  if (!subjectNode) {
    throw new Error("Can't find parentNode with ID" + objectID);
  }
  const relation: Relation = {
    relationType: "CONTAINS",
    a: subjectNode.id,
    b: objectNode.id
  };
  // check if the relationship doesn't exist yet
  if (
    subjectNode.relationsToSubjects.filter(
      rel =>
        rel.relationType === relation.relationType &&
        rel.a === relation.a &&
        rel.b === relation.b
    ).length > 0
  ) {
    return nodes;
  }
  const updatedObject = {
    ...objectNode,
    relationsToSubjects: [...objectNode.relationsToSubjects, relation]
  };
  const updatedSubject = {
    ...subjectNode,
    relationsToObjects: [relation, ...subjectNode.relationsToObjects]
  };
  return nodes.set(objectID, updatedObject).set(subjectID, updatedSubject);
}

export function newNode(text: string, nodeType: NodeType): KnowNode {
  return {
    id: v4(),
    text,
    nodeType,
    relationsToObjects: [],
    relationsToSubjects: []
  };
}
