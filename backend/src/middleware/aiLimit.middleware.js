import { getDb } from '../config/db.js';

export const requireAILimit = (serviceType, maxLimit) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Usuario no autenticado para usar IA' });
            }

            const db = getDb();
            const userId = req.user.id;

            // Buscar registro de IA para este usuario
            let record = await db.get(
                'SELECT * FROM ai_usage WHERE user_id = ? AND service_type = ?',
                [userId, serviceType]
            );

            // Si no existe, crearlo
            if (!record) {
                await db.run(
                    'INSERT INTO ai_usage (user_id, service_type, request_count) VALUES (?, ?, 0)',
                    [userId, serviceType]
                );
                record = { request_count: 0 };
            }

            // Validar límite
            if (record.request_count >= maxLimit) {
                return res.status(429).json({
                    success: false,
                    error: 'Límites de IA excedidos',
                    fallback_action: 'redirect_whatsapp',
                    service: serviceType,
                    limit_reached: maxLimit
                });
            }

            // Si no ha superado, incrementar el contador y continuar
            await db.run(
                'UPDATE ai_usage SET request_count = request_count + 1, last_request = CURRENT_TIMESTAMP WHERE user_id = ? AND service_type = ?',
                [userId, serviceType]
            );

            next();

        } catch (error) {
            next(error);
        }
    };
};
