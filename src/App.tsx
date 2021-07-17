import React from "react";
import { v4 } from "uuid";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import Immutable, { OrderedMap } from "immutable";
import { Storage } from "@stacks/storage";
import { UserSession } from "@stacks/connect";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient
} from "react-query";
import { WorkspaceView } from "./Workspace";
import { NodeView } from "./NodeView";
import {
  RelationContext,
  WorkspaceContext,
  getObjects,
  getSubjects
} from "./DataContext";

import { INTERESTS, saveDataStore } from "./storage";

import { useQueries } from "./useQueries";

import { GraphView } from "./GraphView";

import { Repair } from "./Repair";

import { NavBar } from "./NavBar";

export const TIMELINE = "TIMELINE";

type AppProps = {
  userSession: UserSession;
  createStackStore: (userSession: UserSession) => Storage;
};

function ViewContainer({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="h-100">
      <div
        id="app-container"
        className="menu-default menu-sub-hidden main-hidden sub-hidden"
      >
        <main>
          <div className="container-fluid">
            <div className="dashboard-wrapper">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

function newDefaultWorkspace(nodes: Nodes): Workspace {
  const timelineID = v4();
  const topicsID = v4();

  const timeline = nodes.get(TIMELINE);
  const timelineNodes = timeline ? getObjects(nodes, timeline) : [];
  const timelineViews: Array<NodeView> = timelineNodes.map(node => {
    return {
      nodeID: node.id,
      displayConnections: "RELEVANT_SUBJECTS",
      expanded: false
    };
  });

  const topics = nodes.get(INTERESTS);
  const topicsNodes = topics ? getSubjects(nodes, topics) : [];
  const topicsViews: Array<NodeView> = topicsNodes.map(node => {
    return {
      nodeID: node.id,
      displayConnections: "RELEVANT_SUBJECTS",
      expanded: false
    };
  });
  return {
    index: 0,
    title: "Unnamed Workspace",
    color: "#8f2c3b",
    columns: Immutable.OrderedMap<string, WorkspaceColumn>()
      .set(timelineID, {
        columnID: timelineID,
        nodeViews: Immutable.List<NodeView>(timelineViews)
      })
      .set(topicsID, {
        columnID: topicsID,
        nodeViews: Immutable.List<NodeView>(topicsViews)
      })
  };
}

export function Main({ userSession, createStackStore }: AppProps): JSX.Element {
  const queryClient = useQueryClient();
  const storage = createStackStore(userSession);
  const { userQuery, storageQuery } = useQueries({ userSession, storage });

  const updateStorageMutation = useMutation(
    (newData: Store) => saveDataStore(storage, newData),
    {
      onMutate: async (newStore: Store) => {
        await queryClient.cancelQueries("store");
        const previousValue = queryClient.getQueryData("store");
        queryClient.setQueryData("store", newStore);
        return previousValue;
      },
      onError: (err, variables, previousValue) => {
        queryClient.setQueryData("store", previousValue);
      }
    }
  );
  if (
    userQuery.isLoading ||
    storageQuery.isLoading ||
    storageQuery.data === undefined
  ) {
    return <div className="loading" role="alert" aria-busy="true" />;
  }
  const dataStore = storageQuery.data;

  const upsertNodes = (nodes: Immutable.Map<string, KnowNode>): void => {
    const newStorage = {
      ...dataStore,
      nodes: dataStore.nodes.merge(nodes),
      workspaces: dataStore.workspaces
    };
    updateStorageMutation.mutate(newStorage);
  };

  const deleteNodes = (nodes: Immutable.Set<string>, toUpdate: Nodes): void => {
    const newWorkspaces = dataStore.workspaces.map(workspace => {
      return {
        ...workspace,
        columns: workspace.columns.map(workspaceColumn => {
          return {
            ...workspaceColumn,
            nodeViews: workspaceColumn.nodeViews.filterNot(view =>
              nodes.contains(view.nodeID)
            )
          };
        })
      };
    });
    const newStorage = {
      ...dataStore,
      nodes: dataStore.nodes.merge(toUpdate).removeAll(nodes),
      workspaces: newWorkspaces
    };
    updateStorageMutation.mutate(newStorage);
  };

  const updateWorkspace = (workspace: Workspace, nodes: Nodes): void => {
    const newStorage = {
      ...dataStore,
      nodes: dataStore.nodes.merge(nodes),
      workspaces: dataStore.workspaces.set(workspace.index, workspace)
    };
    updateStorageMutation.mutate(newStorage);
  };

  const selectWorkspace = (index: number): void => {
    const newStorage = {
      ...dataStore,
      activeWorkspace: index
    };
    updateStorageMutation.mutate(newStorage);
  };

  const addWorkspace = (title: string, color: string): void => {
    const updatedWorkspaces = dataStore.workspaces.push({
      title,
      color,
      columns: OrderedMap(),
      index: dataStore.workspaces.size
    });
    const newStorage = {
      ...dataStore,
      workspaces: updatedWorkspaces,
      activeWorkspace: updatedWorkspaces.size - 1
    };
    updateStorageMutation.mutate(newStorage);
  };

  const deleteWorkspace = (index: number): void => {
    const newStorage = {
      ...dataStore,
      workspaces: dataStore.workspaces.remove(index),
      activeWorkspace: Math.max(0, index - 1)
    };
    updateStorageMutation.mutate(newStorage);
  };

  const activeWorkspace =
    dataStore.activeWorkspace > dataStore.workspaces.size
      ? 0
      : dataStore.activeWorkspace;
  const workspaces =
    dataStore.workspaces.size > 0
      ? dataStore.workspaces.map((w, i) => {
          return {
            ...w,
            index: i
          };
        })
      : Immutable.List([newDefaultWorkspace(dataStore.nodes)]);
  const workspace = workspaces.get(activeWorkspace) as Workspace;

  return (
    <div className="h-100 w-100">
      <div
        id="app-container"
        className="menu-sub-hidden main-hidden sub-hidden scroll"
        style={{ backgroundColor: workspace.color }}
      >
        <RelationContext.Provider
          value={{
            nodes: dataStore.nodes,
            upsertNodes,
            deleteNodes
          }}
        >
          <WorkspaceContext.Provider
            value={{
              workspace,
              updateWorkspace,
              addWorkspace,
              selectWorkspace,
              workspaces,
              deleteWorkspace
            }}
          >
            <NavBar />
            <Switch>
              <Route exact path="/">
                <WorkspaceView />
              </Route>
              <Route path="/notes/:id">
                <ViewContainer>
                  <NodeView />
                </ViewContainer>
              </Route>
              <Route path="/graph/:id">
                <GraphView />
              </Route>
              <Route exact path="/graph">
                <GraphView />
              </Route>
              <Route exact path="/repair">
                <Repair />
              </Route>
            </Switch>
          </WorkspaceContext.Provider>
        </RelationContext.Provider>
      </div>
    </div>
  );
}

function App({ userSession, createStackStore }: AppProps): JSX.Element {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Main userSession={userSession} createStackStore={createStackStore} />
    </QueryClientProvider>
  );
}

export default App;
