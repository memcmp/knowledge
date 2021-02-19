import React, { useState } from "react";
import cytoscape, { Ext, LayoutOptions, Collection } from "cytoscape";
import cola from "cytoscape-cola";
import { useSelectors } from "./DataContext";
import { extractPlainText } from "./Searchbox";

const NODE_TYPES: Array<NodeType> = ["TOPIC", "VIEW", "TITLE", "URL"];

function GraphView(): JSX.Element {
  const container = React.useRef<HTMLDivElement>(null);
  const graph = React.useRef<cytoscape.Core>();
  const layout = React.useRef<cytoscape.Layouts>();
  const { getAllNodesByType, getNode } = useSelectors();
  const [selection, setSelection] = useState<Collection>();

  const deleteSelection = () => {
    if (selection) {
      selection.map(ele => console.log(ele.json()));
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
              target: rel.b
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
        graph.current = cytoscape({
          style: [
            {
              selector: "node[text]",
              style: {
                content: "data(text)",
                "font-size": "10px",
                "text-valign": "center",
                "text-halign": "center",
                "background-color": "#555",
                "text-outline-color": "#555",
                "text-outline-width": "2px",
                "text-wrap": "wrap",
                "text-max-width": "120",
                color: "#fff",
                width: "50",
                height: "50"
              }
            },
            {
              selector: "edge",
              style: {
                "curve-style": "bezier",
                "target-arrow-shape": "triangle"
              }
            }
          ],
          elements,
          // maxZoom: 1,
          wheelSensitivity: 0.2,
          container: container.current
        });
        graph.current.on("select unselect", event => {
          if (graph.current) {
            setSelection(graph.current.$(":selected"));
          }
        });
        layout.current = graph.current.elements().makeLayout(({
          name: "cola",
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
