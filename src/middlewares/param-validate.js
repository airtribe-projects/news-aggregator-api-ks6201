"use strict";
import { asyncHandler } from "../libs/utils.js";


/**
 * Middleware function to validate the request parameters (route parameters) against a provided schema.
 * It uses `asyncHandler` to handle asynchronous validation and forwards errors to Express's global 
 * error handler if validation fails.
 * 
 * @param {Object} schema - The schema to validate the request parameters against, typically a validation schema.
 * @returns {Function} Express middleware function that validates the request parameters.
 */
export function paramsValidate(schema) {
    return asyncHandler((
        req,
        _res,
        next
    ) => {
        const params = req.params;
        schema.validate(params);
        next();
    });
}