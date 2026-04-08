import { getDb } from '../../config/db.js';

export const subscribe = async ({ email, source, interested_product }) => {
  const db = getDb();
  const existing = await db.get('SELECT id FROM newsletter_subscribers WHERE email = ?', [email]);

  if (existing) {
    if (interested_product) {
      await db.run(
        'UPDATE newsletter_subscribers SET interested_product = COALESCE(interested_product || \', \' || ?, ?) WHERE email = ?',
        [interested_product, interested_product, email]
      );
    }
    return { message: 'Ya estas suscrito. Gracias.' };
  }

  const discountCode = 'BIENVENIDO10';
  await db.run(
    'INSERT INTO newsletter_subscribers (email, source, interested_product, discount_code) VALUES (?, ?, ?, ?)',
    [email, source || 'popup', interested_product || null, discountCode]
  );

  return {
    message: `Gracias. Tu codigo 10% dcto es: ${discountCode}`,
    discountCode,
  };
};
