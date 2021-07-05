import React from "react";
import Immutable from "immutable";

type Data = {
  nodes: Immutable.Map<string, KnowNode>;
  upsertNodes: UpsertNodes;
  deleteNodes: DeleteNodes;
};

type WorkspaceData = {
  updateWorkspace: UpdateWorkspace;
  workspace: Workspace;
};

const RelationContext = React.createContext<Data | undefined>(undefined);

const WorkspaceContext = React.createContext<WorkspaceData | undefined>(
  undefined
);

function getDataContextOrThrow(): Data {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return context;
}

function getWorkspaceContextOrThrow(): WorkspaceData {
  const context = React.useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("WorkspaceContext not provided");
  }
  return context;
}

function useUpsertNodes(): UpsertNodes {
  return getDataContextOrThrow().upsertNodes;
}

function useDeleteNodes(): DeleteNodes {
  return getDataContextOrThrow().deleteNodes;
}

function useUpdateWorkspace(): UpdateWorkspace {
  return getWorkspaceContextOrThrow().updateWorkspace;
}

function useWorkspace(): Workspace {
  return getWorkspaceContextOrThrow().workspace;
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

export function getObjects(
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

export function getSubjects(
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

function getAllNodesByType(
  nodes: Nodes,
  nodeTypes: Array<NodeType>
): Array<KnowNode> {
  return Array.from(
    nodes.filter(node => nodeTypes.includes(node.nodeType)).values()
  );
}

export type GetObjects = (
  node: KnowNode,
  filter?: Array<NodeType>,
  filterRelations?: Array<RelationType>
) => Array<KnowNode>;

export type GetSubjects = (
  node: KnowNode,
  filter?: Array<NodeType>,
  filterRelations?: Array<RelationType>
) => Array<KnowNode>;

export type Selectors = {
  getNode: (id: string) => KnowNode;
  getObjects: GetObjects;
  getSubjects: GetSubjects;
  getAllNodesByType: (nodeTypes: Array<NodeType>) => Array<KnowNode>;
};

function createSelectors(nodes: Nodes): Selectors {
  return {
    getNode: (id: string): KnowNode => {
      return getNode(nodes, id);
    },
    getObjects: (
      node: KnowNode,
      filter?: Array<NodeType>,
      filterRelations?: Array<RelationType>
    ): Array<KnowNode> => {
      return getObjects(nodes, node, filter, filterRelations);
    },
    getSubjects: (
      node: KnowNode,
      filter?: Array<NodeType>,
      filterRelations?: Array<RelationType>
    ): Array<KnowNode> => {
      return getSubjects(nodes, node, filter, filterRelations);
    },
    getAllNodesByType: (nodeTypes: Array<NodeType>): Array<KnowNode> => {
      return getAllNodesByType(nodes, nodeTypes);
    }
  };
}

function useSelectors(): Selectors {
  const context = React.useContext(RelationContext);
  if (context === undefined) {
    throw new Error("RelationContext not provided");
  }
  return createSelectors(context.nodes);
}

export {
  useNodes,
  useUpsertNodes,
  useUpdateWorkspace,
  useWorkspace,
  RelationContext,
  WorkspaceContext,
  useSelectors,
  getNode,
  useDeleteNodes,
  createSelectors
};
