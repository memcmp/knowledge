import Immutable from "immutable";
import { newNode, createContext } from "./connections";

import {
  getInHeader,
  getInBody,
  getBadge,
  renderNoteDetail
} from "./utils.test";

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

  const renderResult = renderNoteDetail({
    nodes: context.nodes,
    id: flyingCars.id
  });
  getInHeader(renderResult, "Flying Cars");
  getInBody(renderResult, "Checkout Aerocars near you");
  getInBody(renderResult, "Aerocar");
  getInBody(renderResult, "Where is my flying car?");
  getInHeader(renderResult, "Reading List");
  getBadge(renderResult, "Reading List");
});
