"use strict";
import { Validator } from "@d3vtool/utils";
import { ServerError } from "../errors/server-error.js";
import { database } from "../configs/database/database.js";
import { DuplicateError } from "../errors/database-errors.js";
import { HttpClientError, HttpServerError } from "../libs/http-response-code.js";
import { UserPreferencesModel, userPreferencesObj } from "./user-preferences.js";

const userSchema = {
    name: Validator.string().minLength(3),
    email: Validator.string().email(),
    password: Validator.string().password(),
    preferences: userPreferencesObj.preferences.optional(),
}

export const createUserVSchema = Validator.object(userSchema);


export const loginUserVSchema = Validator.object({
    email: userSchema.email,
    password: userSchema.password
});

export class UsersModel {

    static #table = "users";

    /**
     * Creates a new user record in the "users" table.
     * 
     * @param {Object} user - The data for the new user. This object should contain all necessary fields for creating a user record (e.g., name, email, password).
     */
    static async create(
        user
    ) {
        const { preferences, ...userData } = user;

        const cols = Object.keys(userData);
        const values = Object.values(userData);
        
        try {

            await database.startTransaction(async(transactionClient) => {
                const stmt = `INSERT INTO ${this.#table} (${cols.join(", ")}) 
                            VALUES (${values.map((_, idx) => `$${idx + 1}`).join(", ")}) RETURNING id`;
                
                const result = await transactionClient.query(stmt, values);
    
                if(result.rowCount === 0) {
                    throw new ServerError(
                        'Something went wrong while creating new user.',
                        HttpServerError.InternalServerError
                    );
                }
    
                await UserPreferencesModel.createWithTClient({
                    preferences,
                    user_id: result.rows[0].id
                }, transactionClient);
            });
        } catch(err) {
            if(err instanceof DuplicateError) {
                throw new ServerError(
                    `User with record ${err.col}: ${err.value} already exists.`,
                    HttpClientError.Conflict
                );
            }
        }
    }

    /**
     * Fetches specific columns from the "users" table based on the user's email.
     * 
     * @param {string} email - The email address of the user to filter the records by.
     * @param {Array<string>} colsToFetch - An array of column names to fetch from the database.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of user records, each containing the specified columns.
     */
    static async fetchColsByEmail(
        email,
        colsToFetch
    ) {
        const colsData = await database.fetchColsByCol(
            this.#table,
            'email',
            email,
            colsToFetch,
            database
        );

        return colsData;
    }
}