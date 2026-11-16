const { z } = require('zod');
const { ROLES } = require('../../domain/entities/User');
const { PRODUCT_STATUS } = require('../../domain/entities/Product');

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

const createProductSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters long').max(200),
  description: z.string().trim().max(5000).optional().default(''),
  price: z.coerce.number().min(0, 'Price must be a non-negative number'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer'),
  category: z.string().trim().min(1, 'Category is required'),
  status: z.enum(Object.values(PRODUCT_STATUS)).optional(),
  imageUrl: z.string().optional(),
});

const updateProductSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters long').max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().min(0, 'Price must be a non-negative number').optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer').optional(),
  category: z.string().trim().min(1, 'Category is required').optional(),
  status: z.enum(Object.values(PRODUCT_STATUS)).optional(),
  imageUrl: z.string().optional(),
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
  createProductSchema,
  updateProductSchema,
};
