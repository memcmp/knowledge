import React from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import { CreateNote } from "./CreateNote";
import { useSelectors } from "./DataContext";
import { INTERESTS } from "./storage";
import "./editor.css";

import { ReadonlyNode } from "./ReadonlyNode";

type TimelineProps = {
  view: KnowNode;
};

function Timeline({ view }: TimelineProps): JSX.Element {
  const { getObjects, getSubjects, getNode } = useSelectors();
  const nodesInTimeline = [
    ...getSubjects(getNode(INTERESTS)),
    ...getObjects(view)
  ];

  return (
    <>
      <div className="row">
        <CreateNote />
      </div>
      {nodesInTimeline.map(node => (
        <div className="row" key={node.id}>
          <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
            <Link to={`/notes/${node.id}`}>
              <Card>
                <Card.Body className="timeline">
                  <ReadonlyNode node={node} />
                </Card.Body>
              </Card>
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}
export { Timeline };
