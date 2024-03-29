import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { style } from "./graphViewStyle";
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

cytoscape.use((cola as unknown) as Ext);
cytoscape.use((edgehandles as unknown) as Ext);

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
  const [highlightMode, setHighlightMode] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();

  const onEHComplete: EventHandler = (
    ev: EventObject,
    ...extraParams: EdgeSingular[]
  ): void => {
    if (extraParams) {
      const [source, target] = [...extraParams];
      const sourceID = source.data("id") as string;
      const targetID = target.data("id") as string;
      const connected = connectRelevantNodes(
        sourceID,
        targetID,
        Immutable.Map<string, KnowNode>()
          .set(sourceID, getNode(sourceID))
          .set(targetID, getNode(targetID))
      );
      upsertNodes(connected);
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

  const highlight = (sel: Collection): void => {
    if (graph.current) {
      const allElements = graph.current.elements();
      allElements.edges().removeClass("opaque");
      const centerNode = sel.nodes();
      graph.current.animate({
        center: {
          eles: centerNode
        },
        zoom: 2,
        duration: 500
      });
      setHighlightMode(true);
    }
  };

  const toggleHighlightMode = (): void => {
    if (selection && selection.nodes().length > 0) {
      highlight(selection);
    } else if (highlightMode && graph.current) {
      const allElements = graph.current.elements();
      allElements.edges().removeClass("opaque");
      graph.current.animate({
        zoom: 1,
        center: {
          eles: allElements
        },
        duration: 500
      });
      setHighlightMode(false);
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
          text: extractPlainText(node),
          nodeType: node.nodeType
        }
      };
    }),
    ...relations
  ];

  const setHandlers = (g: cytoscape.Core): void => {
    g.removeListener("select unselect ehcomplete");
    g.on("select unselect", () => {
      setSelection(g.$(":selected"));
    });
    g.on("ehcomplete", onEHComplete);
  };

  React.useEffect(() => {
    if (!container.current) {
      return;
    }
    if (graph.current) {
      setHandlers(graph.current);
    }
    try {
      if (!graph.current) {
        graph.current = cytoscape({
          elements,
          wheelSensitivity: 0.2,
          container: container.current,
          style
        });
        graph.current.edgehandles().enable();
        setHandlers(graph.current);

        layout.current = graph.current.elements().makeLayout(({
          name: "cose",
          nodeDimensionsIncludeLabels: true,
          animate: false
        } as unknown) as LayoutOptions);
        layout.current.run();
        if (id) {
          const focusOn = graph.current.$(`[id = "${id}"]`);
          focusOn.select();
          highlight(focusOn);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });

  return (
    <>
      <nav className="navbar fixed-top bg-primary">
        <div className="navbar-left d-flex ml-3">
          <Link to="/">
            <button
              className="header-icon btn btn-empty page-link p-2"
              aria-label="home"
              type="button"
            >
              <i className="simple-icon-home d-block text-white" />
            </button>
          </Link>

          <button
            className="header-icon btn btn-empty page-link p-2"
            onClick={deleteSelection}
            aria-label="delete selected elements"
            type="button"
          >
            <i className="simple-icon-trash d-block text-white" />
          </button>
          {((selection && selection.nodes().length > 0) || highlightMode) && (
            <button
              className="header-icon btn btn-empty page-link p-2"
              onClick={toggleHighlightMode}
              aria-label="delete selected elements"
              type="button"
            >
              <i className="simple-icon-target d-block text-white" />
            </button>
          )}
        </div>
      </nav>
      <div className="graph" ref={container} />
    </>
  );
}

export { GraphView };
