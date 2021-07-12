import React from "react";

import { Button } from "react-bootstrap";

export function ToggleButton(): JSX.Element {
  return (
    <Button as="button" className="btn outer-node-togglebtn hover-black">
      <span className="simple-icon-arrow-right" />
    </Button>
  );
}
