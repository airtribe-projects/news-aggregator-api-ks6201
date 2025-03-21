"use strict";
import { asyncHandler } from "../libs/utils";

/**
 * Middleware function to validate the query parameters in the request against a provided schema.
 * It uses `asyncHandler` to handle asynchronous validation and forwards any errors to Express's 
 * global error handler if validation fails.
 * 
 * @param {Object} schema - The schema to validate the query parameters against, typically a validation schema.
 * @returns {Function} Express middleware function that validates the query parameters.
 */
export function queryValidate(schema) {
    return asyncHandler((
        req,
        _res,
        next
    ) => {
        const query = req.query;
        schema.validate(query);
        next();
    });
}