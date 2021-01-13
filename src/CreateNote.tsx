import React from "react";
import { Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";

function CreateNote(): JSX.Element {
  return (
    <div className="mb-4 col-lg-12 col-xl-6">
      <Card>
        <Card.Body>
          <div className="dashboard-quick-post">
            <div className="row form-group">
              <textarea rows={10} className="form-control"></textarea>
            </div>
            <Button variant="success" className="float-right">
              Save
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export { CreateNote };
