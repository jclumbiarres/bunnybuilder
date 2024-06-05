import { Database } from "bun:sqlite";

export class Query {
  private query: string[] = [];
  private params: any[] = [];
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.db.exec("PRAGMA journal_mode = WAL;");
  }
  // Queries
  select(...campos: string[]): this {
    this.query.push(`SELECT ${campos.join(", ")}`);
    return this;
  }

  from(tabla: string): this {
    this.query.push(`FROM ${tabla}`);
    return this;
  }

  where(condicion: string, params: any[]): this {
    this.query.push(`WHERE ${condicion}`);
    this.params.push(...params);
    return this;
  }

  // CRUD
  insertInto(table: string, fields: string[], values: any[]): this {
    const placeholders = values.map((_, i) => `?${i + 1}`).join(", ");
    this.query.push(
      `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders})`
    );
    this.params.push(...values);
    return this;
  }

  update(table: string): this {
    this.query.push(`UPDATE ${table}`);
    return this;
  }

  set(fields: string[], values: any[]): this {
    const updates = fields.map((field, index) => `${field} = ?${index + 1}`);
    this.query.push(`SET ${updates.join(", ")}`);
    this.params.push(...values);
    return this;
  }

  deleteFrom(table: string): this {
    this.query.push(`DELETE FROM ${table}`);
    return this;
  }

  // utils
  build(): string {
    return this.query.join(" ");
  }

  execute(): any {
    const query = this.build();
    const sql = this.db.query(query);
    const output = sql.all(...this.params);
    this.query = [];
    this.params = [];
    return output;
  }

  close(): void {
    this.db.close();
  }
}
