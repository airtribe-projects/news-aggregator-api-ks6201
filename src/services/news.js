"use strict";
import axios from "axios";
import { SecId } from "@d3vtool/secid";
import { asyncSleep } from "../libs/utils.js";
import { redisClient } from "../configs/redis.js";
import { CONSTANTS } from "../configs/constants.js";
import { UserPreferencesModel } from "../models/user-preferences.js";
import { ServerError } from "../errors/server-error.js";
import { HttpClientError, HttpServerError } from "../libs/http-response-code.js";



export class NewsService {

    static #apiKey = process.env.NEWS_AGG_API_KEY;
    static #apiEndpoint = "https://gnews.io/api/v4/search";

    /**
     * Retrieves cached news data associated with a specific user ID.
     * 
     * @param {string} userId - The unique identifier for the user whose cached news is to be retrieved.
     * 
     */
    static async getCachedNewsByUserId(
        userId
    ) {
        const data = await redisClient.get(`news:${userId}`);
        if(data) {
            return JSON.parse(data);
        }

        return null;
    }

    // on news cache expiry this fn will run to
    // update the cache with new news data. [ per 1hr ].
    /**
     * Updates the cached news data for a specific user ID.
     * 
     * @param {string} userId - The unique identifier for the user whose cached news is to be updated.
     */
    static async updateNewsCache(
        userId
    ) {
        await this.getNewsByPreference(userId);
    }

    /**
     * Fetches news based on the user's preferences.
     * 
     * @param {string} preference - The user's preferences used to the fetch preferred news.
     */
    static async #fetchNews(
        preference
    ) {
        try {
            const response = await axios.get(this.#apiEndpoint, {
                params: {
                    'lang': 'en',
                    'q': preference,
                    'apikey': this.#apiKey,
                }
            });
    
            return response.data;
        } catch {
            // TODO: Maybe log the error using a 'Logger'.
            throw new ServerError(
                "Something went wrong on our side, please try after sometime.",
                HttpServerError.InternalServerError
            );
        }
    }

    /**
     * Sets the news cache for a specific user ID.
     * 
     * @param {string} userId - The unique identifier for the user whose news cache is to be set.
     * @param {Object} news - The news data to be cached.
     * @param {number} expiry - The expiration time (in seconds) for the cached news data.
     */
    static async setNewsCache(
        userId,
        news,
        expiry
    ) {
        await redisClient.set(
            `news:${userId}`,
            JSON.stringify(news),
            { EX: expiry }
        ).catch(() => {}); // TODO: maybe add retry pattern here.
    }


    /**
     * Retrieves news based on a user's preferences.
     *      * 
     * @param {string} userId - The unique identifier for the user whose preferred news is to be retrieved.
     */
    static async getNewsByPreference(
        userId
    ) {
        
        const result = await UserPreferencesModel.fetchColsByUserId(userId, ['preference']);
        const preferences = result.map(item => item.preference);

        const news = {};
        
        // NOTE: Using Promise.all to fetch concurrently 
        // results in status code: 429 'TooManyRequests'.
        // TODO: retry pattern would be nice.
        for(let idx = 0; idx < preferences.length; ++idx) {
            await asyncSleep(2000);
            
            const data = await this.#fetchNews(preferences[idx]);
            
            // need to slice since there're too many articles per preference.
            const newsObj = {
                id: SecId.generate(CONSTANTS.newsIdLength),
                articles: data.articles.slice(0, 10).map(articles => {
                    return {
                        id: SecId.generate(CONSTANTS.newsIdLength),
                        read: false,
                        favorite: false,
                        ...articles,
                    };
                }),
            }

            news[preferences[idx]] = newsObj;
        }
        
        await this.setNewsCache(
            userId, 
            news, 
            CONSTANTS.newsCacheWindow
        );

        return news;
    }


    /**
     * Filters news articles based on a specific key.
     * 
     * @param {string} key - The key used to filter the news articles.
     * @param {Object} news - The key-value pair of preferred news articles to be filtered.
     */
    static filterNewsArticleByKey(
        key,
        news
    ) {
        
        const filteredNews = {};
        for(const preference in news) {
            const currentPreference = news[preference];

            const filteredArticles = [];
            for(let idx = 0; idx < currentPreference.articles.length; ++idx) {
            
                if(!currentPreference.articles[idx][key]) continue;

                filteredArticles.push(currentPreference.articles[idx]);
            }
 
            if(filteredArticles.length === 0) continue;
 
            if(!filteredArticles[preference]) {
                filteredNews[preference] = {};
            }
            filteredNews[preference].articles = filteredArticles;
        }

        return filteredNews;
    }

    
    /**
     * Updates the state of an article with the cached news for a specific user.
     * 
     * @param {string} key - The key used to identify the cache for updating the article state.
     * @param {string} targetArticleId - The unique identifier of the article to be updated.
     * @param {Object} news - The news data used to update the article state.
     * @param {string} userId - The unique identifier of the user whose cached news is being updated.
     */
    static async #updateArticleStateWithCache(
        key,
        targetArticleId,
        news,
        userId        
    ) {
        let found = false;
        for(const preference in news) {
            const currentPreference = news[preference];

            for(let idx = 0; idx < currentPreference.articles.length; ++idx) {
                if(currentPreference.articles[idx].id !== targetArticleId) continue;

                found = true;
                news[preference].articles[idx][key] = true;
                break;
            }
            if(found) break;   
        }

        if(!found) {
            throw new ServerError(
                `Article having id '${targetArticleId}' is not found.`,
                HttpClientError.NotFound
            );
        }

        await NewsService.setNewsCache(
            userId,
            news,
            CONSTANTS.newsCacheWindow
        );
    }


    /**
     * Marks a news article as read for a specific user.
     * 
     * @param {string} targetArticleId - The unique identifier of the article to be marked as read.
     * @param {Object} news - The news data associated with the article being marked as read.
     * @param {string} userId - The unique identifier of the user marking the article as read.
     */
    static async markNewsArticleAsRead(
        targetArticleId,
        news,
        userId
    ) {
        await this.#updateArticleStateWithCache(
            'read',
            targetArticleId,
            news,
            userId
        );
    }


    /**
     * Marks a news article as a favorite for a specific user.
     * 
     * @param {string} targetArticleId - The unique identifier of the article to be marked as a favorite.
     * @param {Object} news - The news data associated with the article being marked as a favorite.
     * @param {string} userId - The unique identifier of the user marking the article as a favorite.
     */
    static async markNewsArticleAsFavorite(
        targetArticleId,
        news,
        userId
    ) {
        await this.#updateArticleStateWithCache(
            'favorite',
            targetArticleId,
            news,
            userId
        );
    }

    /**
     * Filters the provided news articles based on a keyword.
     *
     * @param {Object} news - An object of news articles to be filtered.
     * @param {string} keyword - The keyword to filter the news articles by.
     */
    static filterNewsByKeyword(
        news,
        keyword
    ) {
        const filteredNews = {};

        for(const preference in news) {
            const currentPreference = news[preference];
            
            const filteredArticles = [];
            for(let idx = 0; idx < currentPreference.articles.length; ++idx) {
                
                if( // TODO: maybe creating tags out of 'description' and 'content' would help better.
                    currentPreference?.articles[idx].title.toLowerCase().includes(keyword) ||
                    currentPreference?.articles[idx].description.toLowerCase().includes(keyword)
                    // currentPreference?.articles[idx].content.includes(keyword) ||...
                ) {
                    filteredArticles.push(currentPreference?.articles[idx]);
                }
            }
 
            if(filteredArticles.length === 0) continue;
 
            if(!filteredArticles[preference]) {
                filteredNews[preference] = {};
            }
            filteredNews[preference].articles = filteredArticles;
        }

        return filteredNews;
    }
};