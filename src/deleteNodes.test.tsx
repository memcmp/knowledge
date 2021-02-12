import { fireEvent, waitFor } from "@testing-library/react";
import Immutable from "immutable";
import { renderApp } from "./utils.test";
import { newNode, createContext } from "./connections";

import { getNode } from "./DataContext";

test("Delete Top Node", async () => {
  const readingList = newNode("Reading List", "VIEW");
  const flyingCars = newNode("Flying Cars", "TOPIC");
  const whereIsMyFlyingCar = newNode("Where is my Flying Car?", "TITLE");
  const quote = newNode("Flying is super easy", "QUOTE");
  const referencedQuote = newNode("A quote about stagnation", "QUOTE");
  const context = createContext(Immutable.Map())
    .set(whereIsMyFlyingCar)
    .set(quote)
    .set(readingList)
    .set(flyingCars)
    .set(referencedQuote)
    .connectContains(readingList.id, whereIsMyFlyingCar.id)
    .connectRelevant(whereIsMyFlyingCar.id, flyingCars.id)
    .connectContains(whereIsMyFlyingCar.id, quote.id)
    .connectRelevant(referencedQuote.id, flyingCars.id);
  const { getByTextInHeader, getByLabelText, getStoredNodes } = await renderApp(
    {
      nodes: context.nodes,
      path: `/notes/${whereIsMyFlyingCar.id}`
    }
  );
  fireEvent.click(getByTextInHeader(whereIsMyFlyingCar.text));
  fireEvent.click(getByLabelText("delete"));
  await waitFor(async () => {
    const storedNodes = await getStoredNodes();
    expect(storedNodes.get(whereIsMyFlyingCar.id)).toBeUndefined();
    // Non referenced quotes get also deleted
    expect(storedNodes.get(quote.id)).toBeUndefined();
    // All references to the deleted node are removed
    expect(
      getNode(storedNodes, readingList.id).relationsToSubjects.toArray()
    ).toEqual([]);
    expect(
      getNode(storedNodes, readingList.id).relationsToObjects.toArray()
    ).toEqual([]);

    expect(
      getNode(storedNodes, flyingCars.id).relationsToObjects.toArray()
    ).toEqual([]);
    expect(
      getNode(storedNodes, flyingCars.id).relationsToSubjects.toArray()
    ).toEqual([
      { a: referencedQuote.id, b: flyingCars.id, relationType: "RELEVANT" }
    ]);

    expect(
      getNode(storedNodes, referencedQuote.id).relationsToSubjects.toArray()
    ).toEqual([]);
    expect(
      getNode(storedNodes, referencedQuote.id).relationsToObjects.toArray()
    ).toEqual([
      { a: referencedQuote.id, b: flyingCars.id, relationType: "RELEVANT" }
    ]);
  });
});
