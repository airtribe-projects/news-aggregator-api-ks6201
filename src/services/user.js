"use strict";
import { UsersModel } from "../models/users.js";
import { ServerError } from "../errors/server-error.js";
import { bcryptHash, bcryptCompare, isInDevelopmentMode } from "../libs/utils.js";
import { 
    signJwt, 
    createExpiry, 
    createIssueAt,
    verifyJwt,
    DirtyJwtSignature,
    ExpiredJwt,
    InvalidJwt
} from "@d3vtool/utils";
import { BACKEND } from "../configs/backend.js";
import { UserPreferencesModel } from "../models/user-preferences.js";
import { HttpClientError, HttpServerError } from "../libs/http-response-code.js";

export class UserService {

    static #JWT_SEC = process.env.JWT_SEC;

    /**
     * Registers a new user by creating a user record in the system.
     * This method handles the necessary business logic for user registration,
     * including validation, user creation, and any additional steps.
     * 
     * @param {Object} userData - The data for the new user, which may include fields like name, email, password, etc.
     */
    static async register(
        user
    ) {
        const passwordHash = await bcryptHash(user.password, 10);

        const userData = {
            ...user,
            password: passwordHash
        }

        await UsersModel.create(userData);
    }

    /**
     * Verifies the provided login credentials (e.g., email and password).
     * This method checks if the credentials match a registered user in the system.
     * 
     * @param {Object} loginCreds - The login credentials, typically containing an email and password.
     */
    static async authenticateUser(
        loginCreds
    ) {        
        const result = await UsersModel.fetchColsByEmail(
            loginCreds.email, 
            ['id', 'password']
        );
        
        if(!result[0]?.password) {
            throw new ServerError(
                `User with email: '${loginCreds.email}' does not exists, Please signup and try again.`,
                HttpClientError.NotFound
            );
        }
        
        const isOkay = await bcryptCompare(loginCreds.password, result[0].password);

        if(!isOkay) {
            throw new ServerError(
                "Bad Login credentials, please try again.",
                HttpClientError.Unauthorized
            );
        }

        return result[0].id;
    }

    /**
     * Generates a JWT (JSON Web Token) for a specified audience with optional custom claims.
     * 
     * @param {string} audience - The intended audience for the JWT (typically the recipient or service that will verify the token).
     * @param {Object} customClaims - An object containing additional claims to include in the JWT payload. These claims can contain any user-specific or custom data.
     * @returns {Promise<string>} A promise that resolves to a JWT string, which can be used for authentication or authorization.
     */
    static async generateJwtFor(
        audience,
        customClaims
    ) {
        
        const token = await signJwt(
            {
                aud: audience,
                iss: BACKEND.URL,
                exp: createExpiry("1h"),
                sub: "authenticate-user",
                iat: createIssueAt(new Date(Date.now())),
            },
            customClaims,
            this.#JWT_SEC
        );

        return token;
    }

    /**
     * Verifies the validity of a given JWT (JSON Web Token).
     * 
     * @param {string} token - The JWT to be verified.
     * @returns {Promise<void>} A promise that resolves to the decoded payload if the token is valid, or throws an error if the token is invalid or expired.
     */
    static async verifyJwt(
        token
    ) {
        try {
            return await verifyJwt(token, this.#JWT_SEC);
        } catch(error) {
            if (error instanceof DirtyJwtSignature) {
                throw new ServerError(
                    "JWT signature is invalid or has been tampered with.",
                    HttpClientError.BadRequest
                );
            } else if (error instanceof ExpiredJwt) {
                throw new ServerError(
                    "JWT has expired.",
                    HttpClientError.Unauthorized
                );
            } else if (error instanceof InvalidJwt) {
                throw new ServerError(
                    "JWT is malformed or cannot be decoded.",
                    HttpClientError.BadRequest
                );
            } else {
                throw new ServerError(
                    "Unexpected error:", isInDevelopmentMode() ? error : "Error occured while verifying jwt token.",
                    HttpServerError.InternalServerError
                );
            }
        }
    }


    /**
     * Retrieves the preferences of a specific user by their user ID.
     * 
     * @param {string} userId - The unique identifier for the user whose preferences are to be retrieved.
     */
    static async getPreferencesByUserId(
        userId
    ) {
        const result = await UserPreferencesModel.fetchColsByUserId(userId, ['preference']);
        const preferences = result.map(item => item.preference);
        
        
        return preferences;
    }


    /**
     * Updates the preferences for a specific user.
     * 
     * @param {string} userId - The unique identifier for the user whose preferences are to be updated.
     * @param {Array<string>} preferences - The updated preferences to be set for the user.
     */
    static async updateUserPreference(
        userId,
        preferences
    ) {
        await UserPreferencesModel.updatePreferencesByUserId(
            userId,
            preferences
        );
    }
}