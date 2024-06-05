import { expect, test, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";

import { Query } from "../../src/database/query";

let query: Query;
let db: Database;

beforeAll(() => {
  db = new Database(":memory:");
  query = new Query(db);
});

test("Create database", () => {
  const create = db.exec(
    "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"
  );
  expect(create).toBe(undefined);
});

test("Insert data", () => {
  query.insertInto("users", ["name"], ["John Doe"]).execute();
  const [user] = query
    .select("name")
    .from("users")
    .where("name = ?", ["John Doe"])
    .execute();
  expect(user.name).toBe("John Doe");
});

test("Select data", () => {
  const [user] = query
    .select("name")
    .from("users")
    .where("name = ?", ["John Doe"])
    .execute();
  expect(user.name).toBe("John Doe");
});

test("Update data", () => {
  query.update("users").set(["name"], ["Jane Doe"]).execute();
  const [user] = query
    .select("name")
    .from("users")
    .where("name = ?", ["Jane Doe"])
    .execute();
  expect(user.name).toBe("Jane Doe");
});

test("Delete data", () => {
  query.deleteFrom("users").execute();
  const users = query.select("name").from("users").execute();
  expect(users.length).toBe(0);
});
