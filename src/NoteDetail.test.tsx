import React from "react";
import Immutable from "immutable";
import { Route } from "react-router-dom";

import { newNode, createContext } from "./connections";
import { render, RenderResult } from "@testing-library/react";

import { NoteDetail } from "./NoteDetail";

import { MemoryRouter } from "react-router-dom";

import { RelationContext } from "./DataContext";

function isInHeader(el: HTMLElement): boolean {
  return el.closest(".header") !== null;
}

function getInHeader(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(isInHeader(el)).toBeTruthy();
  return el;
}

function getInBody(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(isInHeader(el)).toBeFalsy();
  return el;
}

function getBadge(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(el.classList.contains("badge-pill")).toBeTruthy();
  return el;
}

test("Display what's relevant for a Topic", () => {
  const flyingCars = newNode("Flying Cars", "TOPIC");
  const notesOnFlyingCars = newNode("Checkout Aerocars near you", "NOTE");
  const aeroCars = newNode("Aerocar", "TOPIC");
  const whereisMyFlyingCar = newNode("Where is my flying car?", "TITLE");
  const quote = newNode("The problematic part of flying is landing", "QUOTE");
  const readingList = newNode("Reading List", "VIEW");

  const context = createContext(Immutable.Map())
    .set(flyingCars)
    .set(notesOnFlyingCars)
    .set(aeroCars)
    .set(whereisMyFlyingCar)
    .set(quote)
    .set(readingList)
    .connectRelevant(notesOnFlyingCars.id, flyingCars.id)
    .connectRelevant(aeroCars.id, flyingCars.id)
    .connectRelevant(whereisMyFlyingCar.id, flyingCars.id)
    .connectRelevant(quote.id, flyingCars.id)
    .connectContains(readingList.id, flyingCars.id);

  const renderResult = render(
    <MemoryRouter initialEntries={[`/notes/${flyingCars.id}/`]}>
      <RelationContext.Provider
        value={{
          addBucket: () => {},
          nodes: context.nodes
        }}
      >
        <Route path="/notes/:id">
          <NoteDetail />
        </Route>
      </RelationContext.Provider>
    </MemoryRouter>
  );
  getInHeader(renderResult, "Flying Cars");
  getInBody(renderResult, "Checkout Aerocars near you");
  getInBody(renderResult, "Aerocar");
  getInBody(renderResult, "Where is my flying car?");
  getInHeader(renderResult, "Reading List");
  getBadge(renderResult, "Reading List");
});
