const express = require('express');
const { auth } = require('../middleware/auth');
const { authorize, ROLES } = require('../middleware/rbac');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');
const { authController } = require('../../container');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes (Any authenticated user)
router.get('/me', auth, authController.getProfile);

// RBAC Protected: Vendor & Admin only
router.get('/vendor/dashboard', auth, authorize(ROLES.VENDOR, ROLES.ADMIN), authController.getVendorDashboard);

// RBAC Protected: Platform Admin only
router.get('/admin/dashboard', auth, authorize(ROLES.ADMIN), authController.getAdminDashboard);

module.exports = router;
