import jwt from 'jsonwebtoken';

export const signToken = (payload, expiresIn = process.env.AUTH_JWT_EXPIRES || '30d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('[JWT] JWT_SECRET no esta configurado. El servidor no puede generar tokens.');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: process.env.JWT_ISSUER || 'ruta-fresca-backend',
    audience: process.env.JWT_AUDIENCE || 'ruta-fresca-clients',
  });
};

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('[JWT] JWT_SECRET no esta configurado.');
  }

  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: process.env.JWT_ISSUER || 'ruta-fresca-backend',
    audience: process.env.JWT_AUDIENCE || 'ruta-fresca-clients',
  });
};
