import { fireEvent } from "@testing-library/react";
import Immutable from "immutable";
import { newNode, createContext } from "./connections";

import { renderNoteDetail, renderApp } from "./utils.test";

test("View relevant Nodes for a Topic", async () => {
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

  const {
    getByTextInHeader,
    getByTextInBody,
    getBadge
  } = await renderNoteDetail({
    nodes: context.nodes,
    id: flyingCars.id
  });
  getByTextInHeader("Flying Cars");
  getByTextInBody("Checkout Aerocars near you");
  getByTextInBody("Aerocar");
  getByTextInBody("Where is my flying car?");
  getByTextInHeader("Reading List");
  getBadge("Reading List");
});

test("View relevant Nodes for a Quote", async () => {
  const whereisMyFlyingCar = newNode("Where is my flying car?", "TITLE");
  const quote = newNode("The problematic part of flying is landing", "QUOTE");
  const note = newNode("Is landing that difficult?", "NOTE");
  const context = createContext(Immutable.Map())
    .set(whereisMyFlyingCar)
    .set(note)
    .set(quote)
    .connectContains(whereisMyFlyingCar.id, quote.id)
    .connectRelevant(note.id, quote.id);
  const { getByTextInBody } = await renderApp({
    nodes: context.nodes,
    path: `/notes/${whereisMyFlyingCar.id}`
  });
  fireEvent.click(getByTextInBody(quote.text));
  getByTextInBody(note.text);
});
