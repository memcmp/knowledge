import React from "react";
import { useDropzone } from "react-dropzone";
import MarkdownIt from "markdown-it";
import { v4 } from "uuid";
import Immutable from "immutable";

import { convertToPlainText } from "./Searchbox";

export function createSourceFromParagraphs(
  paragraphs: Array<string>
): {
  nodes: Nodes;
  topNodeID: string;
} {
  const topParagraph = paragraphs[0];
  const furtherParagraphs = paragraphs.slice(1);

  const topId = v4();

  const bucket: Nodes = Immutable.OrderedMap(
    furtherParagraphs.map((text: string): [string, KnowNode] => {
      const id = v4();
      const relation: Relation = {
        relationType: "CONTAINS",
        a: topId,
        b: id
      };
      return [
        id,
        {
          text,
          nodeType: "QUOTE",
          id,
          relationsToObjects: Immutable.List<Relation>(),
          relationsToSubjects: Immutable.List<Relation>([relation])
        }
      ];
    })
  );

  const relationsToObjects: Relations = Immutable.List<Relation>(
    bucket
      .map(
        (node: KnowNode): Relation => {
          return node.relationsToSubjects.get(0) as Relation;
        }
      )
      .values()
  );
  const topNode: KnowNode = {
    id: topId,
    text: topParagraph,
    nodeType: "TITLE",
    relationsToSubjects: Immutable.List<Relation>(),
    relationsToObjects
  };
  return {
    nodes: bucket.set(topNode.id, topNode),
    topNodeID: topNode.id
  };
}

type FileDropZoneProps = {
  children: React.ReactNode;
  onDrop: (topNodes: Array<string>, nodes: Nodes) => void;
};

type MarkdownReducer = {
  nodes: Nodes;
  topNodeIDs: Array<string>;
};

/* eslint-disable react/jsx-props-no-spreading */
export function FileDropZone({
  children,
  onDrop
}: FileDropZoneProps): JSX.Element {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: ".md",
    onDrop: async (acceptedFiles: Array<File>) => {
      const markdowns = await Promise.all(
        acceptedFiles.map(
          (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.onerror = reject;
              reader.readAsText(file);
            });
          }
        )
      );
      const mdNodes = markdowns.reduce(
        (rdx: MarkdownReducer, markdown: string) => {
          const paragraphs = markdown.split("\n\n");
          const { nodes, topNodeID } = createSourceFromParagraphs(
            paragraphs.map((paragraph: string) => {
              const md = new MarkdownIt();
              return convertToPlainText(md.render(paragraph));
            })
          );
          return {
            nodes: rdx.nodes.merge(nodes),
            topNodeIDs: [...rdx.topNodeIDs, topNodeID]
          };
        },
        {
          nodes: Immutable.Map<string, KnowNode>(),
          topNodeIDs: []
        }
      );
      onDrop(mdNodes.topNodeIDs, mdNodes.nodes);
    }
  });
  const className = isDragActive ? "dimmed" : "";
  return (
    <div {...getRootProps({ className })}>
      {children}
      <input {...getInputProps()} />
    </div>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
