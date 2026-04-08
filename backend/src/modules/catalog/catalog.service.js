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
        comingSoon: Boolean(row.coming_soon),
    }));
};

const SALES_CATALOG_OVERRIDES = {
    'Longaniza de Capitán Pastene': {
        commercialState: 'coming_soon',
        allowSelling: false,
        salesNote: 'Figura como lanzamiento proximo. Se puede captar interes, pero no confirmar venta.',
    },
    'Costillar de Cerdo Nacional': {
        commercialState: 'coming_soon',
        allowSelling: false,
        salesNote: 'Figura como lanzamiento proximo. Se puede captar interes, pero no confirmar venta.',
    },
    'Costillar Ahumado Capitán Pastene': {
        commercialState: 'coming_soon',
        allowSelling: false,
        salesNote: 'Figura como lanzamiento proximo. Se puede captar interes, pero no confirmar venta.',
    },
};

const buildSalesCatalogEntry = (product) => {
    const override = SALES_CATALOG_OVERRIDES[product.name];
    const isReferenceCheese = product.category === 'quesos';

    const commercialState = override?.commercialState
        || (product.comingSoon ? 'coming_soon' : (product.inStock ? 'available' : 'unavailable'));

    const allowSelling = override?.allowSelling ?? commercialState === 'available';
    const priceLabel = override?.priceLabel
        || (isReferenceCheese
            ? 'Valor referencial por 1/4 kg; el final depende del peso real.'
            : (commercialState === 'coming_soon'
                ? 'Lanzamiento proximo'
                : (typeof product.price === 'number' && product.price > 0 ? `$${product.price}` : 'Precio a confirmar')));

    const salesNote = override?.salesNote
        || (isReferenceCheese
            ? 'Explicar siempre que el valor publicado es referencial por 1/4 kg y el final depende del peso real.'
            : (commercialState === 'available'
                ? 'Producto visible en catalogo. La confirmacion final de disponibilidad la hace el equipo humano.'
                : 'No confirmar venta directa; solo captar interes y derivar a humano.'));

    return {
        ...product,
        commercialState,
        allowSelling,
        priceLabel,
        salesNote,
    };
};

export const getSalesCatalogSnapshot = async () => {
    const products = await getAllProducts();
    const catalog = products.map(buildSalesCatalogEntry);

    return {
        verifiedAt: new Date().toISOString(),
        totalProducts: catalog.length,
        sellableProducts: catalog.filter((product) => product.allowSelling).length,
        catalog,
    };
};
