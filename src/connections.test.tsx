import { newNode, connectRelevantNodes } from "./connections";
import { getNode } from "./DataContext";
import Immutable from "immutable";

test("Don't duplicate connections", () => {
  const flyingCars = newNode("Flying Cars", "TOPIC");
  const aeroCars = newNode("Aerocar", "TOPIC");
  const connection1 = connectRelevantNodes(
    flyingCars.id,
    aeroCars.id,
    Immutable.Map({
      [flyingCars.id]: flyingCars,
      [aeroCars.id]: aeroCars
    })
  );
  const connections = connectRelevantNodes(
    flyingCars.id,
    aeroCars.id,
    connection1
  );
  expect(getNode(connections, flyingCars.id).relationsToObjects).toHaveLength(
    1
  );
});
