import React from "react";
import Immutable from "immutable";

const RelationContext = React.createContext<
  | {
      nodes: Immutable.Map<string, KnowNode>;
      addBucket: AddRelations;
    }
  | undefined
>(undefined);

function useAddBucket(): AddRelations {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return context.addBucket;
}

function useNodes(): Nodes {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return context.nodes;
}

function getNode(nodes: Nodes, id: string): KnowNode {
  const node = nodes.get(id);
  if (!node) {
    throw new Error(`Node ${id} not found`);
  }
  return node;
}

function getObjects(
  nodes: Nodes,
  node: KnowNode,
  filter?: Array<NodeType>,
  filterRelations?: Array<RelationType>
): Array<KnowNode> {
  return node.relationsToObjects
    .filter(r =>
      filterRelations === undefined
        ? true
        : filterRelations.includes(r.relationType)
    )
    .map(relation => getNode(nodes, relation.b))
    .filter(n => (filter === undefined ? true : filter.includes(n.nodeType)))
    .toArray();
}

function getSubjects(
  nodes: Nodes,
  node: KnowNode,
  filter?: Array<NodeType>,
  filterRelations?: Array<RelationType>
): Array<KnowNode> {
  return node.relationsToSubjects
    .filter(r =>
      filterRelations === undefined
        ? true
        : filterRelations.includes(r.relationType)
    )
    .map(relation => getNode(nodes, relation.a))
    .filter(n => (filter === undefined ? true : filter.includes(n.nodeType)))
    .toArray();
}

function getAllNodesByType(nodes: Nodes, nodeType: NodeType): Array<KnowNode> {
  // TODO: reverse or just use a better algorithm to find nodes for the context
  return Array.from(nodes.filter(node => node.nodeType === nodeType).values());
}

function useSelectors(): {
  getNode: (id: string) => KnowNode;
  getObjects: (
    node: KnowNode,
    filter?: Array<NodeType>,
    filterRelations?: Array<RelationType>
  ) => Array<KnowNode>;
  getSubjects: (
    node: KnowNode,
    filter?: Array<NodeType>,
    filterRelations?: Array<RelationType>
  ) => Array<KnowNode>;
  getAllNodesByType: (nodeType: NodeType) => Array<KnowNode>;
} {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return {
    getNode: (id: string): KnowNode => {
      return getNode(context.nodes, id);
    },
    getObjects: (
      node: KnowNode,
      filter?: Array<NodeType>,
      filterRelations?: Array<RelationType>
    ): Array<KnowNode> => {
      return getObjects(context.nodes, node, filter, filterRelations);
    },
    getSubjects: (
      node: KnowNode,
      filter?: Array<NodeType>,
      filterRelations?: Array<RelationType>
    ): Array<KnowNode> => {
      return getSubjects(context.nodes, node, filter, filterRelations);
    },
    getAllNodesByType: (nodeType: NodeType): Array<KnowNode> => {
      return getAllNodesByType(context.nodes, nodeType);
    }
  };
}

export { useNodes, useAddBucket, RelationContext, useSelectors, getNode };
