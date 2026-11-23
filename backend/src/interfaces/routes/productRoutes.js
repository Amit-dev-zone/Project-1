const express = require('express');
const { auth } = require('../middleware/auth');
const { authorize, ROLES } = require('../middleware/rbac');
const { validate, createProductSchema, updateProductSchema } = require('../middleware/validate');
const upload = require('../middleware/upload');
const { productController } = require('../../container');

const router = express.Router();

// Public: Marketplace product discovery with multidimensional filtering & search
router.get('/', productController.getPublicProducts);

// Vendor-specific catalog retrieval (must be before /:id)
router.get('/vendor', auth, authorize(ROLES.VENDOR, ROLES.ADMIN), productController.getVendorProducts);

// Get single product details
router.get('/:id', productController.getProductById);

// Create a new vendor product (supports optional image file upload)
router.post(
  '/',
  auth,
  authorize(ROLES.VENDOR, ROLES.ADMIN),
  upload.single('image'),
  validate(createProductSchema),
  productController.createProduct
);

// Update an existing vendor product (enforces vendor ownership)
router.put(
  '/:id',
  auth,
  authorize(ROLES.VENDOR, ROLES.ADMIN),
  upload.single('image'),
  validate(updateProductSchema),
  productController.updateProduct
);

// Delete a vendor product (enforces vendor ownership)
router.delete(
  '/:id',
  auth,
  authorize(ROLES.VENDOR, ROLES.ADMIN),
  productController.deleteProduct
);

module.exports = router;
