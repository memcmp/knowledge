import { fireEvent, waitFor } from "@testing-library/react";
import Immutable from "immutable";
import { newNode, createContext } from "./connections";

import { getNode } from "./DataContext";

import { renderApp } from "./utils.test";

test("Edit Node", async () => {
  const note = newNode("Shall I hold Bitcoin?", "NOTE");
  const context = createContext(Immutable.Map()).set(note);
  const {
    getByTextInHeader,
    getByLabelText,
    findByLabelText,
    getStoredNodes,
    typeIntoEditor
  } = await renderApp({
    nodes: context.nodes,
    path: `/notes/${note.id}`
  });
  fireEvent.click(getByTextInHeader(note.text));
  fireEvent.click(getByLabelText("edit"));
  typeIntoEditor("Shall I hodl Bitcoin?");
  fireEvent.click(await findByLabelText("save"));
  await waitFor(async () => {
    expect(getNode(await getStoredNodes(), note.id).text).toEqual(
      "<p>Shall I hodl Bitcoin?</p>"
    );
  });
});
