import React from "react";
import Immutable from "immutable";

type AddRelations = (bucket: Store) => void;

const RelationContext = React.createContext<
  | {
      relations: Relations;
      nodes: Immutable.Map<string, KnowNode>;
      addBucket: AddRelations;
    }
  | undefined
>(undefined);

function useRelations(): Relations {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return context.relations;
}

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
  relations: Relations,
  id: string
): Array<KnowNode> {
  return relations
    .filter(relation => relation.a === id)
    .map(relation => getNode(nodes, relation.b));
}

function useSelectors(): {
  getNode: (id: string) => KnowNode;
  getChildren: (id: string) => Immutable.List<KnowNode>;
} {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return {
    getNode: (id: string): KnowNode => {
      return getNode(context.nodes, id);
    },
    getChildren: (id: string): Immutable.List<KnowNode> => {
      return Immutable.List(getChildren(context.nodes, context.relations, id));
    }
  };
}

export { useRelations, useNodes, useAddBucket, RelationContext, useSelectors };
