"use strict";

import { createClient } from "redis";
import { NewsService } from "../services/news.js";

export const redisClient = createClient({
    url: process.env.REDIS_URL,
});

const subscriber = createClient({
    url: process.env.REDIS_URL,
});

export async function redisSetup() {

    await redisClient.connect().catch(err => {
        throw new Error("Redis connection error: ", err.message);
    });

    await subscriber.connect();
    await subscriber.subscribe('__keyevent@0__:expired', async(expiredKey) => {
        if(expiredKey.startsWith("news")) {
            const userId = expiredKey.split(":")[1];
            await NewsService.updateNewsCache(userId);
        }
    });
}