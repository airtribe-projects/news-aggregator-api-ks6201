"use strict";
import { NewsService } from "../services/news.js";
import { ServerError } from "../errors/server-error.js";
import { HttpClientError } from "../libs/http-response-code.js";



export class NewsController {

    /**
     * Handles requests to retrieve news based on user preferences.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response objec.
     */
    static async getNewsByPreferences(
        req,
        res
    ) {
        
        const claims = req.claims;
        
        let news = await NewsService.getCachedNewsByUserId(claims.userId);

        if(!news) {
            news = await NewsService.getNewsByPreference(claims.userId);
        }

        res.json({
            status: "success",
            news
        });
    }


    /**
     * Handles requests to mark a news article as read.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response objec.
     */
    static async markNewsArticleRead(
        req,
        res
    ) {
        const targetArticleId = req.params.id;

        const claims = req.claims;

        const news = await NewsService.getCachedNewsByUserId(claims.userId);
        
        if(!news) {
            throw new ServerError(
                'The resource once existed but has now been removed (expired).',
                HttpClientError.Gone
            );
        }

        await NewsService.markNewsArticleAsRead(
            targetArticleId,
            news,
            claims.userId
        );

        res.json({
            status: 'success'
        });
    }


    /**
     * Handles requests to retrieve read news articles.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async getReadNewsArticles(
        req,
        res
    ) {

        const claims = req.claims;

        const news = await NewsService.getCachedNewsByUserId(claims.userId);
        
        if(!news) {
            throw new ServerError(
                'The resource once existed but has now been removed (expired).',
                HttpClientError.Gone
            );
        }

        const filteredNews = NewsService.filterNewsArticleByKey(
            'read',
            news
        );
 
        res.json({
            status: 'success',
            news: filteredNews
        });
    }

    /**
     * Handles requests to mark a news article as a favorite.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */    
    static async markNewsArticleFavorite(
        req,
        res
    ) {
        const targetArticleId = req.params.id;

        const claims = req.claims;

        const news = await NewsService.getCachedNewsByUserId(claims.userId);
        
        if(!news) {
            throw new ServerError(
                'The resource once existed but has now been removed (expired).',
                HttpClientError.Gone
            );
        }

        await NewsService.markNewsArticleAsFavorite(
            targetArticleId,
            news,
            claims.userId
        );

        res.json({
            status: 'success'
        });
    }


    /**
     * Handles requests to retrieve favorite news articles.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async getFavoritesNewsArticles(
        req,
        res
    ) {

        const claims = req.claims;

        const news = await NewsService.getCachedNewsByUserId(claims.userId);
        
        if(!news) {
            throw new ServerError(
                'The resource once existed but has now been removed (expired).',
                HttpClientError.Gone
            );
        }

        const filteredNews = NewsService.filterNewsArticleByKey(
            'favorite',
            news
        );

        res.json({
            status: 'success',
            news: filteredNews
        });
    }


    /**
     * Handles requests to retrieve news articles by keyword.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */    
    static async getNewsArticlesByKeyword(
        req,
        res
    ) {

        const keyword = req.params.keyword.toLowerCase();
        
        const claims = req.claims;

        let news = await NewsService.getCachedNewsByUserId(claims.userId);
        
        if(!news) {
            news = await NewsService.getNewsByPreference(claims.userId);
        }

        const filteredNews = NewsService.filterNewsByKeyword(
            news,
            keyword
        );

        res.json({
            status: 'success',
            news: filteredNews
        });
    }
};