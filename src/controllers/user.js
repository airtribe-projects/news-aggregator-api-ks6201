"use strict";
import { UserService } from "../services/user.js";


export class UserControllers {

    /**
     * Handles user signup requests.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response objec.
     */
    static async signup(req, res) {
        const signUpData = req.body;
        
        await UserService.register(signUpData);
        
        res.json({
            status: 'success',
        });
    }


    /**
     * Handles user login requests.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response objec.
     */
    static async login(req, res) {
        const loginCreds = req.body;
    
        const userId = await UserService.authenticateUser(loginCreds);
        
        const jwt = await UserService.generateJwtFor(
            req.hostname,
            {
                userId,
                email: loginCreds.email
            }
        );
    
        res.json({
            status: 'success',
            token: jwt,
        });
    }


    /**
     * Handles requests to retrieve user preferences.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response objec.
     */
    static async getUserPreferences(
        req,
        res
    ) {
        const claims = req.claims;
        
        const preferences = await UserService.getPreferencesByUserId(claims.userId);

        res.json({
            status: 'success',
            preferences
        });
    }


    /**
     * Handles requests to update user preferences.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response objec.
     */
    static async updateUserPreferences(
        req,
        res
    ) {
        const claims = req.claims;
        const { preferences } = req.body;
        
        await UserService.updateUserPreference(
            claims.userId,
            preferences
        );

        res.json({
            status: 'success'
        });
    }
}