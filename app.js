"use strict";
import "@d3vtool/strict-env/setup";
import express from "express";
import { userRouter } from "./src/routes/user.js";
import { newsRouter } from "./src/routes/news.js";
import { BACKEND } from "./src/configs/backend.js";
import { redisSetup } from "./src/configs/redis.js";
import { errorHandler } from './src/middlewares/error-handler.js';
import { authMiddleware } from "./src/middlewares/auth-middleware.js";

await redisSetup();

const app = express();
const port = BACKEND.PORT;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);
app.use("/news", authMiddleware, newsRouter);

app.use(errorHandler);

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});



export { app };