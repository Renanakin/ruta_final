import jwt from 'jsonwebtoken';

const DEFAULT_ISSUER = 'ruta-fresca-backend';
const DEFAULT_CUSTOMER_AUDIENCE = 'ruta-fresca-clients';
const DEFAULT_CRM_AUDIENCE = 'ruta-fresca-crm';

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('[JWT] JWT_SECRET no esta configurado.');
  }

  return process.env.JWT_SECRET;
};

const buildJwtOptions = ({ audience, expiresIn, subject }) => {
  const options = {
    issuer: process.env.JWT_ISSUER || DEFAULT_ISSUER,
    audience,
  };

  if (expiresIn !== undefined) {
    options.expiresIn = expiresIn;
  }

  if (subject !== undefined && subject !== null) {
    options.subject = String(subject);
  }

  return options;
};

const verifyTokenUse = (decoded, expectedTokenUse) => {
  if (decoded?.token_use !== expectedTokenUse) {
    throw new Error(`[JWT] token_use invalido: se esperaba ${expectedTokenUse}`);
  }

  return decoded;
};

export const getCustomerJwtAudience = () => process.env.JWT_AUDIENCE || DEFAULT_CUSTOMER_AUDIENCE;
export const getCrmJwtAudience = () => process.env.CRM_JWT_AUDIENCE || DEFAULT_CRM_AUDIENCE;

export const signCustomerToken = (payload, expiresIn = process.env.AUTH_JWT_EXPIRES || '30d') => {
  const secret = ensureJwtSecret();

  return jwt.sign(
    { ...payload, token_use: 'customer_access' },
    secret,
    buildJwtOptions({
      audience: getCustomerJwtAudience(),
      expiresIn,
      subject: payload?.id,
    })
  );
};

export const signCrmToken = (payload, expiresIn = process.env.CRM_JWT_EXPIRES || '8h') => {
  const secret = ensureJwtSecret();

  return jwt.sign(
    { ...payload, token_use: 'crm_access' },
    secret,
    buildJwtOptions({
      audience: getCrmJwtAudience(),
      expiresIn,
      subject: payload?.id,
    })
  );
};

export const verifyCustomerToken = (token) => {
  const secret = ensureJwtSecret();
  const decoded = jwt.verify(
    token,
    secret,
    buildJwtOptions({
      audience: getCustomerJwtAudience(),
      expiresIn: undefined,
      subject: undefined,
    })
  );

  return verifyTokenUse(decoded, 'customer_access');
};

export const verifyCrmToken = (token) => {
  const secret = ensureJwtSecret();
  const decoded = jwt.verify(
    token,
    secret,
    buildJwtOptions({
      audience: getCrmJwtAudience(),
      expiresIn: undefined,
      subject: undefined,
    })
  );

  return verifyTokenUse(decoded, 'crm_access');
};

export const signToken = signCustomerToken;
export const verifyToken = verifyCustomerToken;
