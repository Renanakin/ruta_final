import { getDb } from '../../config/db.js';

/**
 * Servicio para el catálogo de productos.
 */

export const getAllProducts = async () => {
    const db = getDb();
    const rows = await db.all('SELECT * FROM products ORDER BY id');
    
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        image: row.image,
        badge: row.badge,
        inStock: Boolean(row.in_stock),
        extendedDescription: row.extended_description,
        nutrition: Array.isArray(row.nutrition) ? row.nutrition : JSON.parse(row.nutrition || '[]'),
        origin: row.origin,
        reviews: Array.isArray(row.reviews) ? row.reviews : JSON.parse(row.reviews || '[]'),
        category: row.category,
    }));
};
