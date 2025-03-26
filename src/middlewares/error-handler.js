"use strict";
import { isInDevelopmentMode } from "../libs/utils.js";
import { ServerError } from "../errors/server-error.js";
import { ObjectValidationError } from "@d3vtool/utils";
import { HttpClientError, HttpServerError } from "../libs/http-response-code.js";

/**
 * Global error handler middleware for Express applications.
 * This function handles errors passed through the middleware chain 
 * and sends a response to the client with an appropriate status code 
 * and error message.
 * 
 * @param {Error} err - The error object.
 * @param {Object} _req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} _next - The next middleware function.
 */
export function errorHandler(
    err,
    req,
    res,
    _next
) {
    
    if(err instanceof ObjectValidationError) {
        const response = {
            status: "error",
            error: "ValidationError",
            message: `Key ${err.key}: ${err.message}`,
            stackTrace: isInDevelopmentMode() ?  err.stack : undefined
        }

        let statusCode = HttpClientError.BadRequest;
        if(req.url === "/users/login" && err.key === "password") {
            statusCode = HttpClientError.Unauthorized;
        }
        
        return res.status(statusCode).json(response);
    } else if(err instanceof ServerError) {
        const response = {
            status: "error",
            error: err.name,
            message: err.message,
            stackTrace: isInDevelopmentMode() ?  err.stack : undefined
        }

        return res.status(err.statusCode).json(response);
    }
    
    console.log(err);
    
    res.status(HttpServerError.InternalServerError).json({
        status: "error",
        error: "Unknown",
        message: "Something went wrong!",
        stackTrace: isInDevelopmentMode() ? err.stack : undefined
    });
}