# Bunnybuilder

Small SQLite3 query builder for [Bun](https://bun.sh) 

## Small example

```ts
import { QueryBuilder } from "./database/query";
import { Database } from "bun:sqlite";

const dbconn = new QueryBuilder(new Database("db.sqlite"));

export const databaseInit = (db: QueryBuilder) => {
  db.createTable("users", [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TEXT",
    "password TEXT",
  ]);

  db.createTable("channels", [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TEXT",
  ]);

  db.createTable("messages", [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "message TEXT",
    "date TEXT",
    "sender INTEGER",
    "receiver INTEGER",
    "channel INTEGER",
    "FOREIGN KEY(channel) REFERENCES channels(id)",
  ]);

  db.insertInto("channels", ["name"], ["general"]).execute();

  db.insertInto(
    "users",
    ["name", "password"],
    ["Joe Bananas", "12345"]
  ).execute();

  db.insertInto(
    "users",
    ["name", "password"],
    ["Crazy Gallo", "12345"]
  ).execute();

  db.insertInto(
    "messages",
    ["message", "date", "sender", "receiver", "channel"],
    ["Hello, World!", "2021-09-01", 1, 2, 1]
  ).execute();

  const querySample = db
    .select(
      "senderUsers.name as senderName",
      "receiverUsers.name as receiverName",
      "messages.message"
    )
    .from("messages")
    .join("users as senderUsers", "senderUsers.id = messages.sender")
    .join("users as receiverUsers", "receiverUsers.id = messages.receiver")
    .execute();

  console.log(querySample);

  db.close();
};

databaseInit(dbconn);
```
