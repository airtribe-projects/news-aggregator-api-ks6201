"use strict";
import { asyncHandler } from "../libs/utils.js"
import { UserService } from "../services/user.js";
import { ServerError } from "../errors/server-error.js";
import { HttpClientError } from "../libs/http-response-code.js";



export const authMiddleware = asyncHandler(async(
    req,
    _res,
    next
) => {
    const authHeader = req.get('Authorization');

    const token = authHeader?.split(" ")[1]?.trim();

    if(!token) {
        throw new ServerError(
            "Auth token not found.",
            HttpClientError.Unauthorized
        );
    }

    const claims = await UserService.verifyJwt(token);

    req.claims = claims;

    next();
});