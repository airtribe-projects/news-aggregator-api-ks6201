"use strict";
import { Router } from "express";
import { asyncHandler } from "../libs/utils.js";
import { NewsController } from "../controllers/news.js";
import { paramsValidate } from "../middlewares/param-validate.js";
import { newsIdValidator, newsKeywordValidator } from "../v-schemas/news.js";


export const newsRouter = Router();

newsRouter.get(
    "/", 
    asyncHandler(NewsController.getNewsByPreferences)
);

newsRouter.get(
    "/read",
    asyncHandler(NewsController.getReadNewsArticles)
);

newsRouter.post(
    "/:id/read",
    paramsValidate(newsIdValidator),
    asyncHandler(NewsController.markNewsArticleRead)
);

newsRouter.post(
    "/:id/favorite",
    paramsValidate(newsIdValidator),
    asyncHandler(NewsController.markNewsArticleFavorite)
);

newsRouter.get(
    "/favorite",
    asyncHandler(NewsController.getFavoritesNewsArticles)
);


newsRouter.get(
    "/search/:keyword",
    paramsValidate(newsKeywordValidator),
    asyncHandler(NewsController.getNewsArticlesByKeyword)
);