import { v4 } from "uuid";
import Immutable from "immutable";

import { getNode, getObjects } from "./DataContext";

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

export function bulkConnectRelevantNodes(
  subjectIDs: Array<string>,
  objectID: string,
  nodes: Nodes
): Nodes {
  return subjectIDs.reduce(
    (reducer: Nodes, subjectID: string) =>
      connectRelevantNodes(subjectID, objectID, reducer),
    nodes
  );
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

export function disconnectNode(nodes: Nodes, nodeID: string): Nodes {
  const node = getNode(nodes, nodeID);
  return node.relationsToObjects
    .concat(node.relationsToSubjects)
    .reduce((reducer: Nodes, relation: Relation): Nodes => {
      const relatingNode =
        relation.a === nodeID
          ? getNode(nodes, relation.b)
          : getNode(nodes, relation.a);
      return reducer.set(relatingNode.id, {
        ...relatingNode,
        relationsToSubjects: relatingNode.relationsToSubjects.filter(
          rel => rel.a !== nodeID && rel.b !== nodeID
        ),
        relationsToObjects: relatingNode.relationsToObjects.filter(
          rel => rel.a !== nodeID && rel.b !== nodeID
        )
      });
    }, nodes);
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

function removeRelation(
  relations: Relations,
  a: string,
  b: string,
  relationType: RelationType
): Relations {
  return relations.filter(
    relation =>
      !(
        relation.a === a &&
        relation.b === b &&
        relation.relationType === relationType
      )
  );
}

export function removeRelationToObject(
  node: KnowNode,
  objectID: string,
  relationType: RelationType
): KnowNode {
  const newRelations = removeRelation(
    node.relationsToObjects,
    node.id,
    objectID,
    relationType
  );
  return {
    ...node,
    relationsToObjects: newRelations
  };
}

export function removeRelationToSubject(
  node: KnowNode,
  subjectID: string,
  relationType: RelationType
): KnowNode {
  return {
    ...node,
    relationsToSubjects: removeRelation(
      node.relationsToSubjects,
      subjectID,
      node.id,
      relationType
    )
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

export type DeleteNodesContext = {
  toUpdate: Nodes;
  toRemove: Immutable.Set<string>;
};

export function planNodeDeletion(
  nodes: Nodes,
  node: KnowNode
): DeleteNodesContext {
  const unreferencedQuotes = getObjects(nodes, node, ["QUOTE"], ["CONTAINS"])
    .filter(
      quote =>
        quote.relationsToSubjects.size === 1 &&
        quote.relationsToObjects.size === 0
    )
    .map(quote => quote.id);
  const toUpdate = disconnectNode(nodes, node.id);
  return {
    toUpdate,
    toRemove: Immutable.Set([node.id, ...unreferencedQuotes])
  };
}

export function defaultDisplayConnection(
  nodeType: NodeType
): DisplayConnections {
  if (["TITLE", "URL", "VIEW"].includes(nodeType)) {
    return "CONTAINS_OBJECTS";
  }
  if (["QUOTE"].includes(nodeType)) {
    return "RELEVANT_OBJECTS";
  }
  return "RELEVANT_SUBJECTS";
}
