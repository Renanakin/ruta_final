import * as catalogService from './catalog.service.js';

/**
 * Controlador para el catálogo de productos.
 */

export const getProducts = async (req, res, next) => {
    try {
        const products = await catalogService.getAllProducts();
        res.status(200).json({ success: true, products });
    } catch (error) {
        next(error);
    }
};
