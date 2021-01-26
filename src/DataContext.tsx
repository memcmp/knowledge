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
    throw new Error("Node not found");
  }
  return node as KnowNode;
}

function getChildren(
  nodes: Nodes,
  node: KnowNode,
  filter?: Array<NodeType>
): Array<KnowNode> {
  return node.childRelations
    .map(relation => getNode(nodes, relation.b))
    .filter(n => (filter === undefined ? true : filter.includes(n.nodeType)));
}

function useSelectors(): {
  getNode: (id: string) => KnowNode;
  getChildren: (node: KnowNode, filter?: Array<NodeType>) => Array<KnowNode>;
} {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return {
    getNode: (id: string): KnowNode => {
      return getNode(context.nodes, id);
    },
    getChildren: (
      node: KnowNode,
      filter?: Array<NodeType>
    ): Array<KnowNode> => {
      return getChildren(context.nodes, node, filter);
    }
  };
}

export { useNodes, useAddBucket, RelationContext, useSelectors };
