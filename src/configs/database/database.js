"use strict";
import pg from "pg";
import { PG_ERROR_CODE_MAP } from "./error.js";
import { DatabaseError, DuplicateError } from "../../errors/database-errors.js";

const { Pool, DatabaseError: PG_DBERROR } = pg;

/**
 * Creates an instance of the Database class.
 * 
 * @param {string} databaseName - The name of the database to connect to.
 */
class Database {
    #pool;

    constructor(
        databaseName,
    ) {        
        this.#pool = new Pool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: databaseName,
        });
    }

    /**
     * Executes an SQL statement with optional associated values.
     *
     * @param {string} stmt - The SQL statement to be executed.
     * @param {(Array<any>)} - Optional values associated with the SQL statement.
     * 
     * @throws {DatabaseError}
     */
    async query(
        stmt,
        values
    ) {
        const client = await this.#pool.connect();

        try {
            return await client.query(stmt, values);
        } catch(err) {
            if(err instanceof PG_DBERROR) {
                const errorMsg = PG_ERROR_CODE_MAP[err.code];
                throw new DatabaseError(
                    `Error executing query '${stmt}'.\nError: ${errorMsg ?? err.message}`,
                    "query"
                );
            }

            throw new DatabaseError(
                `Error executing query '${stmt}'.\nError: ${err.message}`,
                "query"
            );
        } finally {
            client.release();
        }
    }


    /**
     * Starts a transaction and executes the provided function within the transaction context.
     *
     * @param {function(PoolClient): Promise<void>} fn - A function that takes a `PoolClient` (transaction client) 
     *                                                   as an argument.
     * @throws {DatabaseError}
     */    
    async startTransaction(fn) {

        const client = await this.#pool.connect();

        try {
            await client.query("BEGIN");
            await fn(client);
            await client.query("COMMIT");
        } catch(err) {
            await client.query("ROLLBACK");
            
            if(err instanceof PG_DBERROR) {
                const errorMsg = PG_ERROR_CODE_MAP[err.code];

                switch(true) {
                    case (errorMsg === 'Duplicate'):
                        const matches = [...err.detail.matchAll(/\(([^)]+)\)/g)];

                        throw new DuplicateError(
                            matches[0][1],
                            matches[1][1]
                        );
                    default:
                        throw new DatabaseError(
                            `Error executing transacton.\nError: ${errorMsg ?? err.message}`,
                            "transaction"
                        );
                }
            }
            
            throw new DatabaseError(
                `Error executing transacton.\nError: ${err.message}`,
                "transaction"
            );
        } finally {
            client.release();
        }
    }

    /**
     * Fetches specific columns from the "users" table based on a given column name and value.
     * 
     * @param {string} tableName - The name of the column to filter the records by.
     * @param {string} colName - The name of the column to filter the records by.
     * @param {string | number} colData - The value of the column to match against.
     * @param {Array<string>} colsToFetch - An array of column names to fetch from the database.
     * @param {PoolClient} client - An array of column names to fetch from the database.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of records, each containing the specified columns.
     */
    async fetchColsByCol(
        tableName,
        colName,
        colData,
        colsToFetch,
        client
    ) {
        
        const colsToFetchStr = colsToFetch.join(", ");
        const stmt = `SELECT ${colsToFetchStr} FROM ${tableName} WHERE ${colName}=$1`;
        const result = await client.query(
            stmt, [colData]
        );

        return result.rows;
    }
}

export const database = new Database(process.env.DATABASE);