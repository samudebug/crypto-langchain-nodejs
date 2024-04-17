import { DynamicStructuredTool } from "@langchain/core/tools";
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import * as z from "zod";
export class SQLiteTools {
  private constructor(private db: Database) {}

  /**
   * Initializes an object that holds the tools and the functions that the tools will run
   *
   * @returns an instance of [SQLiteTools]
   */
  public static async init(): Promise<SQLiteTools> {
    const db = await open({
      filename: "db.sqlite",
      driver: sqlite3.Database,
    });
    db.on("trace", (data: any) => {
      console.error(data);
    });

    return new SQLiteTools(db);
  }
  /**
   * Reads all the table names on the database
   *
   * @returns A string with a list of all the table names on the database
   */
  async listTables(): Promise<string> {
    const result = await this.db.all(
      `SELECT name FROM sqlite_master WHERE type='table';`
    );
    const tableNames = result.map((e) => e.name);
    return tableNames.join("\n");
  }

  /**
   * Runs a SQL Query on the database
   *
   * @param query A SQL Query
   * @returns The result of the query
   */
  async runSqliteQuery(query: string): Promise<string> {
    const result = await this.db.all(query);
    return result
      .map((e) => {
        return Object.keys(e)
          .map((key) => `${key} ${e[key]}`)
          .join("\n");
      })
      .join("\n");
  }

  /**
   *
   * @param tableNames An array with a name of tables to describe
   * @returns A [string] with the description of the tables
   */

  async describeTables(tableNames: string[]): Promise<string> {
    const tables = tableNames.map((e) => `'${e}'`).join(", ");
    const result = await this.db.all(
      `SELECT sql FROM sqlite_master WHERE type='table' and name IN (${tables});`
    );

    return result
      .map((e) => {
        return Object.keys(e)
          .map((key) => `${key} ${e[key]}`)
          .join("\n");
      })
      .join("\n");
  }

  public get runQueryTool() {
    return new DynamicStructuredTool({
      name: "run_sqlite_query",
      description: "Runs a SQLite Query",
      schema: z.object({
        query: z.string().describe("A SQL Query"),
      }),
      func: async ({ query }) => {
        return await this.runSqliteQuery(query);
      },
    });
  }

  public get describeTablesTool() {
    return new DynamicStructuredTool({
      name: "describe_tables",
      description:
        "Given a list of table names, returns the schema of those tables",
      schema: z.object({
        tableNames: z
          .array(z.string())
          .describe("An array with a name of tables to describe"),
      }),
      func: async ({ tableNames }) => {
        return await this.describeTables(tableNames);
      },
    });
  }
}
