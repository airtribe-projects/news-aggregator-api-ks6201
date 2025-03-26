"use strict";
import { Router } from "express";
import { asyncHandler } from "../libs/utils.js";
import { UserControllers } from "../controllers/user.js";
import { bodyValidate } from "../middlewares/body-validate.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { userPreferencesSchema } from "../models/user-preferences.js";
import { createUserVSchema, loginUserVSchema } from "../models/users.js";

export const userRouter = Router();

userRouter.post(
    "/signup", 
    bodyValidate(createUserVSchema),
    asyncHandler(UserControllers.signup)
);

userRouter.post(
    "/login", 
    bodyValidate(loginUserVSchema),
    asyncHandler(UserControllers.login)
);

userRouter.get(
    "/preferences", 
    authMiddleware,
    asyncHandler(UserControllers.getUserPreferences)
);

userRouter.put(
    "/preferences",
    bodyValidate(userPreferencesSchema), 
    authMiddleware,
    asyncHandler(UserControllers.updateUserPreferences)
);