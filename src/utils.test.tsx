import React from "react";
import { render, RenderResult } from "@testing-library/react";
import { Route, MemoryRouter } from "react-router-dom";
import { RelationContext } from "./DataContext";
import { NoteDetail } from "./NoteDetail";

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip("skip", () => {});

export function isInHeader(el: HTMLElement): boolean {
  return el.closest(".header") !== null;
}

export function getInHeader(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(isInHeader(el)).toBeTruthy();
  return el;
}

export function getInBody(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(isInHeader(el)).toBeFalsy();
  return el;
}

export function getBadge(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(el.classList.contains("badge-pill")).toBeTruthy();
  return el;
}

export function renderNoteDetail({
  nodes,
  id
}: {
  nodes: Nodes;
  id: string;
}): RenderResult {
  return render(
    <MemoryRouter initialEntries={[`/notes/${id}/`]}>
      <RelationContext.Provider
        value={{
          addBucket: jest.fn(),
          nodes
        }}
      >
        <Route path="/notes/:id">
          <NoteDetail />
        </Route>
      </RelationContext.Provider>
    </MemoryRouter>
  );
}
