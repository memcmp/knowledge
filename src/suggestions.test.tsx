import Immutable from "immutable";
import { newNode, createContext } from "./connections";

import { createSelectors } from "./DataContext";

import { getSuggestions } from "./NoteDetailSuggestion";

test("Suggest Views", () => {
  const readingList = newNode("Reading List", "VIEW");
  const flyingCars = newNode("Flying Cars", "TOPIC");
  const context = createContext(Immutable.Map())
    .set(readingList)
    .set(flyingCars);
  const selectors = createSelectors(context.nodes);
  expect(getSuggestions(selectors, flyingCars)).toContain(readingList);
});
