export class AlchemistError extends Error {
  constructor(message, { code = 'ALCHEMIST_ERROR', statusCode = 500, details, expose = true } = {}) {
    super(message);
    this.name = 'AlchemistError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.expose = expose;
  }
}

export class AlchemistValidationError extends AlchemistError {
  constructor(message, details) {
    super(message, {
      code: 'ALCHEMIST_VALIDATION_ERROR',
      statusCode: 400,
      details,
    });
    this.name = 'AlchemistValidationError';
  }
}

export class AlchemistProviderError extends AlchemistError {
  constructor(message, details) {
    super(message, {
      code: 'ALCHEMIST_PROVIDER_ERROR',
      statusCode: 502,
      details,
    });
    this.name = 'AlchemistProviderError';
  }
}

export class AlchemistConfigurationError extends AlchemistError {
  constructor(message, details) {
    super(message, {
      code: 'ALCHEMIST_CONFIGURATION_ERROR',
      statusCode: 500,
      details,
    });
    this.name = 'AlchemistConfigurationError';
  }
}
