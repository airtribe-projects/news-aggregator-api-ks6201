"use strict";
import { asyncHandler } from "../libs/utils.js";


/**
 * Middleware function to validate the request body against a provided schema.
 * It uses the `asyncHandler` to handle asynchronous validation and pass errors 
 * to Express's global error handler if validation fails.
 * 
 * @param {Object} schema - The schema to validate the request body against, typically a validation schema.
 * @returns {Function} Express middleware function that validates the request body.
 */
export function bodyValidate(schema) {
    return asyncHandler((
        req,
        _res,
        next
    ) => {
        const body = req.body;
        schema.validate(body);
        next();
    });
}