import Immutable from "immutable";
import { newNode, connectRelevantNodes, moveRelations } from "./connections";
import { getNode } from "./DataContext";

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
  expect(getNode(connections, flyingCars.id).relationsToObjects.size).toBe(1);
});

test("Move Relations", () => {
  const rel0: Relation = { relationType: "RELEVANT", a: "0", b: "object" };
  const rel1: Relation = { relationType: "RELEVANT", a: "1", b: "object" };
  const rel2: Relation = { relationType: "RELEVANT", a: "2", b: "object" };
  const rel3: Relation = { relationType: "RELEVANT", a: "3", b: "object" };
  const relations = Immutable.List<Relation>([rel0, rel1, rel2, rel3]);
  // only 0 and 3 are displayed, and the user moves 3 before 0
  const sorted = moveRelations(["0", "3"], relations, 1, 0);
  expect(sorted.toArray()).toEqual([rel3, rel0, rel1, rel2]);
});
