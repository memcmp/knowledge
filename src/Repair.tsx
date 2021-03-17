import React from "react";

import { useNodes, useSelectors, useUpsertNodes } from "./DataContext";

function Repair(): JSX.Element {
  const nodes = useNodes();
  const upsertNodes = useUpsertNodes();
  const { getObjects, getSubjects, getNode } = useSelectors();
  const report = nodes.map((node: KnowNode): string => {
    try {
      getObjects(node);
    } catch (e) {
      const ex: Error = e as Error;
      return `${node.text}:\n\nObject not found ${ex.message}`;
    }
    try {
      getSubjects(node);
    } catch (e) {
      const ex: Error = e as Error;
      return `${node.text}:\n\nSubject not found ${ex.message}`;
    }
    return "";
  });
  const repair = (): void => {
    const newNodes = nodes.map((node: KnowNode) => {
      return {
        ...node,
        relationsToObjects: node.relationsToObjects.filter(rel => {
          try {
            getNode(rel.b);
            return true;
          } catch {
            return false;
          }
        }),
        relationsToSubjects: node.relationsToSubjects.filter(rel => {
          try {
            getNode(rel.a);
            return true;
          } catch {
            return false;
          }
        })
      };
    });
    upsertNodes(newNodes);
  };
  return (
    <div>
      {report.map(r => {
        return <div>{r}</div>;
      })}
      <button onClick={repair} type="button">
        Repair
      </button>
    </div>
  );
}

export { Repair };
