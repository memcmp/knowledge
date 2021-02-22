import { CssStyleDeclaration } from "cytoscape";

export const style: CssStyleDeclaration = [
  {
    selector: "node[text]",
    style: {
      content: "data(text)",
      "font-size": "10px",
      "text-valign": "center",
      "text-halign": "center",
      "background-color": "#999",
      "text-outline-color": "#555",
      "text-outline-width": "0.1px",
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
      "background-color": "#145388",
      "text-outline-color": "#77828C",
      "text-outline-width": "1px"
    }
  },
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      opacity: 0.5
    }
  },
  {
    selector: ".eh-handle",
    style: {
      "background-color": "green",
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
      "background-color": "#145388"
    }
  },

  {
    selector: ".eh-source",
    style: {
      "border-width": 2,
      "border-color": "#145388"
    }
  },

  {
    selector: ".eh-target",
    style: {
      "border-width": 2,
      "border-color": "#145388"
    }
  },

  {
    selector: ".eh-preview, .eh-ghost-edge",
    style: {
      "background-color": "#145388",
      "line-color": "green",
      "target-arrow-color": "green",
      "source-arrow-color": "green"
    }
  },
  {
    selector: ".eh-ghost-edge.eh-preview-active",
    style: {
      opacity: 0.1
    }
  },
  {
    selector: ".hidden",
    style: {
      display: "none"
    }
  },
  {
    selector: ".opaque",
    style: {
      opacity: 0.1
    }
  }
];
