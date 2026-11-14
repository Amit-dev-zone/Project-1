const { z } = require('zod');
const { ROLES } = require('../../domain/entities/User');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(Object.values(ROLES)).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      });
    }
    next(error);
  }
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
};
