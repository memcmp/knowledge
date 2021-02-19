import React, { useState } from "react";
import cytoscape, {
  Ext,
  LayoutOptions,
  Collection,
  EdgeSingular,
  EventObject,
  EventHandler
} from "cytoscape";
import cola from "cytoscape-cola";
import Immutable from "immutable";
import edgehandles from "cytoscape-edgehandles";
import {
  useDeleteNodes,
  useNodes,
  useSelectors,
  useUpsertNodes
} from "./DataContext";
import { extractPlainText } from "./Searchbox";

import {
  removeRelationToObject,
  removeRelationToSubject,
  DeleteNodesContext,
  planNodeDeletion,
  connectRelevantNodes
} from "./connections";

const NODE_TYPES: Array<NodeType> = ["TOPIC", "VIEW", "TITLE", "URL"];

function GraphView(): JSX.Element {
  const container = React.useRef<HTMLDivElement>(null);
  const graph = React.useRef<cytoscape.Core>();
  const layout = React.useRef<cytoscape.Layouts>();
  const { getAllNodesByType, getNode } = useSelectors();
  const allNodes = useNodes();
  const deleteNodes = useDeleteNodes();
  const upsertNodes = useUpsertNodes();
  const [selection, setSelection] = useState<Collection>();

  const onEHComplete: EventHandler = (
    ev: EventObject,
    ...extraParams: EdgeSingular[]
  ): void => {
    if (extraParams) {
      const [source, target] = [...extraParams];
      upsertNodes(
        connectRelevantNodes(
          source.data("id") as string,
          target.data("id") as string,
          allNodes
        )
      );
    }
  };

  const deleteSelection = (): void => {
    if (selection) {
      const nodesWithEdgesRemoved = selection
        .edges()
        .reduce((rdx: Nodes, edge): Nodes => {
          const relationType = edge.data("relationType") as RelationType;
          const sourceID = edge.data("source") as string;
          const targetID = edge.data("target") as string;
          const source = rdx.get(sourceID, getNode(sourceID));
          const target = rdx.get(targetID, getNode(targetID));
          return rdx
            .set(
              sourceID,
              removeRelationToObject(source, targetID, relationType)
            )
            .set(
              targetID,
              removeRelationToSubject(target, sourceID, relationType)
            );
        }, Immutable.Map<string, KnowNode>());

      const finalCTX = selection.nodes().reduce(
        (rdx: DeleteNodesContext, toDelete): DeleteNodesContext => {
          const nodeID = toDelete.data("id") as string;
          const node = rdx.toUpdate.get(nodeID, getNode(nodeID));
          const deleteCTX = planNodeDeletion(allNodes, node);
          return {
            toRemove: rdx.toRemove.merge(deleteCTX.toRemove),
            toUpdate: rdx.toUpdate.merge(deleteCTX.toUpdate)
          };
        },
        { toRemove: Immutable.Set<string>(), toUpdate: nodesWithEdgesRemoved }
      );

      deleteNodes(finalCTX.toRemove, finalCTX.toUpdate);
      selection.map(ele => ele.remove());
    }
  };

  const nodes = getAllNodesByType(NODE_TYPES);
  const relations = nodes
    .map(node =>
      node.relationsToObjects
        .filter(rel => NODE_TYPES.includes(getNode(rel.b).nodeType))
        .map(rel => {
          return {
            data: {
              id: rel.a + rel.b,
              source: rel.a,
              target: rel.b,
              relationType: rel.relationType
            }
          };
        })
        .toArray()
    )
    .flat()
    .flat();
  const elements = [
    ...nodes.map(node => {
      return {
        data: {
          id: node.id,
          text: extractPlainText(node)
        }
      };
    }),
    ...relations
  ];

  React.useEffect(() => {
    if (!container.current) {
      return;
    }
    try {
      if (!graph.current) {
        cytoscape.use((cola as unknown) as Ext);
        cytoscape.use((edgehandles as unknown) as Ext);
        graph.current = cytoscape({
          style: [
            {
              selector: "node[text]",
              style: {
                content: "data(text)",
                "font-size": "10px",
                "text-valign": "center",
                "text-halign": "center",
                "background-color": "#666",
                "text-outline-color": "#555",
                "text-outline-width": "2px",
                "text-wrap": "wrap",
                "text-max-width": "50",
                color: "#fff",
                width: "70",
                height: "70",
                "font-weight": "bold"
              }
            },
            {
              selector: "node:selected",
              style: {
                "border-width": "6px",
                "border-color": "#AAD8FF",
                "border-opacity": 0.5,
                "background-color": "#77828C",
                "text-outline-color": "#77828C"
              }
            },
            {
              selector: "edge",
              style: {
                "curve-style": "bezier",
                "target-arrow-shape": "triangle",
                opacity: 0.333
              }
            },
            {
              selector: ".eh-handle",
              style: {
                "background-color": "red",
                width: 12,
                height: 12,
                shape: "ellipse",
                "overlay-opacity": 0,
                "border-width": 12, // makes the handle easier to hit
                "border-opacity": 0
              }
            },

            {
              selector: ".eh-hover",
              style: {
                "background-color": "red"
              }
            },

            {
              selector: ".eh-source",
              style: {
                "border-width": 2,
                "border-color": "red"
              }
            },

            {
              selector: ".eh-target",
              style: {
                "border-width": 2,
                "border-color": "red"
              }
            },

            {
              selector: ".eh-preview, .eh-ghost-edge",
              style: {
                "background-color": "red",
                "line-color": "red",
                "target-arrow-color": "red",
                "source-arrow-color": "red"
              }
            },

            {
              selector: ".eh-ghost-edge.eh-preview-active",
              style: {
                opacity: 0
              }
            }
          ],
          elements,
          // maxZoom: 1,
          wheelSensitivity: 0.2,
          container: container.current
        });
        graph.current.edgehandles().enable();

        graph.current.on("select unselect", () => {
          if (graph.current) {
            setSelection(graph.current.$(":selected"));
          }
        });
        graph.current.on("ehcomplete", onEHComplete);
        layout.current = graph.current.elements().makeLayout(({
          name: "cola",
          rows: 1,
          nodeDimensionsIncludeLabels: true
        } as unknown) as LayoutOptions);
        layout.current.run();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, []);

  return (
    <>
      <nav className="navbar fixed-top">
        <div className="navbar-left d-flex ml-3">
          <a className="header-icon btn btn-empty d-sm-inline-block" href="/">
            <i className="simple-icon-home d-block" />
          </a>

          <button
            className="header-icon btn btn-empty"
            onClick={deleteSelection}
            aria-label="delete selected elements"
            type="button"
          >
            <i className="simple-icon-trash d-block" />
          </button>
        </div>
      </nav>
      <div className="graph" ref={container} />
    </>
  );
}

export { GraphView };
