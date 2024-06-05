import { expect, test, beforeAll, describe, afterAll } from "bun:test";
import { Database } from "bun:sqlite";

import { Query } from "../../src/database/query";

let query: Query;
let db: Database;

describe("Database CRUD", () => {
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
  afterAll(() => {
    db.exec("DROP TABLE users");
  });
});

describe("Database Relationships", () => {
  test("Create tables", () => {
    db.exec(
      "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role_id INTEGER)"
    );
    db.exec("CREATE TABLE roles (id INTEGER PRIMARY KEY, name TEXT)");
  });

  test("Insert data", () => {
    query.insertInto("users", ["name", "role_id"], ["John Doe", 1]).execute();
    query.insertInto("roles", ["name"], ["Admin"]).execute();
    const [user] = query
      .select("users.name", "roles.name as role")
      .from("users")
      .leftJoin("roles", "users.role_id = roles.id")
      .where("users.name = ?", ["John Doe"])
      .execute();
    expect(user.name).toBe("John Doe");
    expect(user.role).toBe("Admin");
  });

  test("Update data", () => {
    query.update("roles").set(["name"], ["Super Admin"]).execute();
    const [user] = query
      .select("users.name", "roles.name as role")
      .from("users")
      .leftJoin("roles", "users.role_id = roles.id")
      .where("users.name = ?", ["John Doe"])
      .execute();
    expect(user.role).toBe("Super Admin");
  });

  test("Inner join", () => {
    const [user] = query
      .select("users.name", "roles.name as role")
      .from("users")
      .innerJoin("roles", "users.role_id = roles.id")
      .where("users.name = ?", ["John Doe"])
      .execute();
    expect(user.role).toBe("Super Admin");
  });

  test("Join with where", () => {
    const [user] = query
      .select("users.name", "roles.name as role")
      .from("users")
      .join("roles", "users.role_id = roles.id")
      .where("users.name = ? AND roles.name = ?", ["John Doe", "Super Admin"])
      .execute();
    expect(user.role).toBe("Super Admin");
  });

  test("Right join", () => {
    const [user] = query
      .select("users.name", "roles.name as role")
      .from("users")
      .rightJoin("roles", "users.role_id = roles.id")
      .where("users.name = ?", ["John Doe"])
      .execute();
    expect(user.role).toBe("Super Admin");
  });

  test("Left join", () => {
    const [user] = query
      .select("users.name", "roles.name as role")
      .from("users")
      .leftJoin("roles", "users.role_id = roles.id")
      .where("users.name = ?", ["John Doe"])
      .execute();
    expect(user.role).toBe("Super Admin");
  });

  test("Delete data", () => {
    query.deleteFrom("users").execute();
    query.deleteFrom("roles").execute();
    const users = query.select("name").from("users").execute();
    const roles = query.select("name").from("roles").execute();
    expect(users.length).toBe(0);
    expect(roles.length).toBe(0);
  });

  afterAll(() => {
    db.close();
  });
});
