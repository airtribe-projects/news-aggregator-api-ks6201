"use strict";

/**
 * Creates an instance of ServerError.
 * 
 * @param {string} message - The error message describing the server issue.
 * @param {string} statusCode - Http response code.
 */
export class ServerError extends Error {
    statusCode;
    
    constructor(
        message,
        statusCode
    ) {
        super(message);
        this.name = "ServerError";
        this.statusCode = statusCode;
    }
}