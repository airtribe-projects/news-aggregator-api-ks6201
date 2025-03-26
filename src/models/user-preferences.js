"use strict";
import { Validator } from "@d3vtool/utils";
import { database } from "../configs/database/database.js";

export const userPreferencesObj = {
    preferences: Validator.array(),
}

export const userPreferencesSchema = Validator.object(userPreferencesObj);

export class UserPreferencesModel {
    static #table = 'user_preferences';

    /**
     * Creates a new user preferences record in the "user_preferences" table.
     * 
     * @param {Object} preferencesData - The data for the new user preferences. This object should contain all necessary fields for creating a user preferences record.
     */
    static async create(
        preferencesData
    ) {
        const preferencesStmt = `INSERT INTO ${this.#table} (preference, user_id)
                                    VALUES ($1, $2)`;


        const promises = preferencesData.preferences.map(preference => {
            return database.query(
                preferencesStmt, [preference, preferencesData.id]
            );
        });

        await Promise.all(promises);      
    }

    /**
     * Creates a new user preferences record in the database within a transaction.
     * This method ensures that the operation is part of the given transaction using the provided `tClient`.
     * 
     * @param {Object} preferencesData - The data for the new user preferences. This object should contain all necessary fields for creating a user preferences record.
     * @param {Object} tClient - The transaction client that manages the transaction for this operation. This ensures the operation is executed within the scope of a transaction.
     */
    static async createWithTClient(
        preferencesData,
        tClient
    ) {
        const preferencesStmt = `INSERT INTO ${this.#table} (preference, user_id)
                                    VALUES ($1, $2)`;


        const promises = preferencesData.preferences.map(preference => {
            return tClient.query(preferencesStmt, [preference, preferencesData.user_id])
        });

        await Promise.all(promises);
    }

    /**
     * Fetches specific columns from the "users" table based on the user's id.
     * 
     * @param {string} id - The id of the user to filter the records by.
     * @param {Array<string>} colsToFetch - An array of column names to fetch from the database.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of user records, each containing the specified columns.
     */
    static async fetchColsByUserId(
        userId,
        colsToFetch
    ) {
        const colsData = await database.fetchColsByCol(
            this.#table,
            'user_id',
            userId,
            colsToFetch,
            database
        );

        return colsData;
    }

    /**
     * Updates the preferences of a specific user by their user ID.
     * 
     * @param {string} userId - The unique identifier for the user whose preferences are to be updated.
     * @param {Array<string>} newPreferences - The new preferences to be set for the user.
     */
    static async updatePreferencesByUserId(
        userId,
        newPreferences
    ) {

        const stmt = `INSERT INTO ${this.#table} (preference, user_id)
                VALUES ($1, $2)
                ON CONFLICT (preference)
                DO NOTHING;`;

        const promises = newPreferences.map(
            preference => database.query(stmt, [preference, userId])
        );

        await Promise.all(promises);
    }
}