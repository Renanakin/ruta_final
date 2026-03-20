import * as newsletterService from './newsletter.service.js';

/**
 * Controlador para newsletter.
 */

export const subscribe = async (req, res, next) => {
    try {
        const result = await newsletterService.subscribe(req.body);
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};
