import { v4 } from "uuid";
import Immutable from "immutable";

export function connectRelevantNodes(
  subjectID: string,
  objectID: string,
  nodes: Nodes
): Nodes {
  const objectNode = nodes.get(objectID);
  const subjectNode = nodes.get(subjectID);
  if (!objectNode) {
    throw new Error(`Can't find childNode with ID${objectID}`);
  }
  if (!subjectNode) {
    throw new Error(`Can't find parentNode with ID${objectID}`);
  }
  const relation: Relation = {
    relationType: "RELEVANT",
    a: subjectNode.id,
    b: objectNode.id
  };
  // check if the relationship doesn't exist yet
  if (
    subjectNode.relationsToSubjects
      .concat(subjectNode.relationsToObjects)
      .filter(
        rel =>
          rel.relationType === relation.relationType &&
          rel.a === relation.a &&
          rel.b === relation.b
      ).size > 0
  ) {
    return nodes;
  }

  const updatedObject = {
    ...objectNode,
    relationsToSubjects: objectNode.relationsToSubjects.push(relation)
  };
  const updatedSubject = {
    ...subjectNode,
    relationsToObjects: subjectNode.relationsToObjects.push(relation)
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
    throw new Error(`Can't find childNode with ID${objectID}`);
  }
  if (!subjectNode) {
    throw new Error(`Can't find parentNode with ID${objectID}`);
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
    ).size > 0
  ) {
    return nodes;
  }
  const updatedObject = {
    ...objectNode,
    relationsToSubjects: objectNode.relationsToSubjects.push(relation)
  };
  const updatedSubject = {
    ...subjectNode,
    relationsToObjects: subjectNode.relationsToObjects.insert(0, relation)
  };
  return nodes.set(objectID, updatedObject).set(subjectID, updatedSubject);
}

export function newNode(text: string, nodeType: NodeType): KnowNode {
  return {
    id: v4(),
    text,
    nodeType,
    relationsToObjects: Immutable.List<Relation>(),
    relationsToSubjects: Immutable.List<Relation>()
  };
}

type DataManipulatingContext = {
  nodes: Nodes;
  addNewNode: (text: string, nodeType: NodeType) => DataManipulatingContext;
  set: (node: KnowNode) => DataManipulatingContext;
  connectRelevant: (
    subjectID: string,
    objectID: string
  ) => DataManipulatingContext;
  connectContains: (
    subjectID: string,
    objectID: string
  ) => DataManipulatingContext;
};

export function createContext(nodes: Nodes): DataManipulatingContext {
  return {
    nodes,
    set: (node: KnowNode): DataManipulatingContext => {
      return createContext(nodes.set(node.id, node));
    },
    addNewNode: (text: string, nodeType: NodeType): DataManipulatingContext => {
      const node = newNode(text, nodeType);
      return createContext(nodes.set(node.id, node));
    },
    connectRelevant: (
      subjectID: string,
      objectID: string
    ): DataManipulatingContext => {
      return createContext(connectRelevantNodes(subjectID, objectID, nodes));
    },
    connectContains: (
      subjectID: string,
      objectID: string
    ): DataManipulatingContext => {
      return createContext(connectContainingNodes(subjectID, objectID, nodes));
    }
  };
}

export function moveRelations(
  displayedRelations: Array<string>,
  relations: Relations,
  oldIndex: number,
  newIndex: number
): Relations {
  const subjectToMove = displayedRelations[oldIndex];
  const moveBeforeSubject = displayedRelations[newIndex];
  const oldIdx = relations.findIndex(rel => rel.a === subjectToMove);
  const relation = relations.get(oldIdx) as Relation;
  const newIdx = relations.findIndex(rel => rel.a === moveBeforeSubject);
  return relations.remove(oldIdx).insert(newIdx, relation);
}
