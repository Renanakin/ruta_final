export const validateBody = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten();
    const firstFieldError = Object.values(errors.fieldErrors).flat().find(Boolean);
    const firstFormError = errors.formErrors.find(Boolean);
    const missingRequiredField = Object.values(errors.fieldErrors)
      .flat()
      .find((message) => String(message).includes('received undefined'));

    return res.status(400).json({
      success: false,
      error: missingRequiredField ? 'Campos requeridos' : (firstFormError || firstFieldError || 'Datos invalidos'),
      errors,
    });
  }
  req.body = parsed.data;
  return next();
};

export const validateParams = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.params);
  if (!parsed.success) {
    const errors = parsed.error.flatten();
    const firstFieldError = Object.values(errors.fieldErrors).flat().find(Boolean);
    const firstFormError = errors.formErrors.find(Boolean);

    return res.status(400).json({
      success: false,
      error: firstFormError || firstFieldError || 'Parametros invalidos',
      errors,
    });
  }
  req.params = parsed.data;
  return next();
};
