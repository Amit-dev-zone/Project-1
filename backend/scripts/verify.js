const { User, ROLES } = require('../src/domain/entities/User');
const { Product, PRODUCT_STATUS } = require('../src/domain/entities/Product');
const PasswordHasher = require('../src/infrastructure/security/PasswordHasher');
const TokenService = require('../src/infrastructure/security/TokenService');
const UserService = require('../src/application/services/UserService');
const ProductService = require('../src/application/services/ProductService');
const UserModel = require('../src/infrastructure/models/UserModel');
const ProductModel = require('../src/infrastructure/models/ProductModel');
const { auth, createAuthMiddleware } = require('../src/interfaces/middleware/auth');
const { authorize } = require('../src/interfaces/middleware/rbac');
const { validate, registerSchema, loginSchema } = require('../src/interfaces/middleware/validate');
const app = require('../src/app');

async function runVerification() {
  console.log('='.repeat(65));
  console.log('🚀 RUNNING COMPREHENSIVE BACKEND VERIFICATION SUITE');
  console.log('='.repeat(65));
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Domain Entities
  console.log('\n[1] Pure Domain Entities:');
  const user = new User({
    name: 'Test Vendor',
    email: 'vendor@axlero.com',
    role: ROLES.VENDOR,
  });
  assert(user.isVendor() === true, 'User entity correctly identifies VENDOR role');
  assert(user.toPublicJSON().passwordHash === undefined, 'User toPublicJSON omits password hash');

  const product = new Product({
    vendorId: 'vendor-123',
    title: 'Wireless Earbuds',
    price: 79.99,
    stock: 15,
    category: 'Audio',
  });
  assert(product.isInStock() === true, 'Product entity correctly reports in-stock status');
  product.decreaseStock(5);
  assert(product.stock === 10, 'Product stock decreases correctly from 15 to 10');

  // 2. Mongoose Schemas
  console.log('\n[2] Infrastructure Mongoose Models:');
  assert(typeof UserModel.schema === 'object', 'UserModel Mongoose schema loaded');
  assert(typeof ProductModel.schema === 'object', 'ProductModel Mongoose schema loaded');

  // 3. Security Infrastructure
  console.log('\n[3] Security Layer:');
  const hasher = new PasswordHasher(8);
  const plainPass = 'VendorSecurePass#2026';
  const hashed = await hasher.hash(plainPass);
  const isMatch = await hasher.compare(plainPass, hashed);
  assert(isMatch === true, 'PasswordHasher securely hashes and compares passwords');

  const tokenService = new TokenService('jwt_secret_key_with_at_least_32_characters_long_for_test', '2h');
  const vendorToken = tokenService.generateToken({ id: 'user-vendor-1', role: ROLES.VENDOR, email: 'vendor@axlero.com' });
  const customerToken = tokenService.generateToken({ id: 'user-cust-1', role: ROLES.CUSTOMER, email: 'customer@axlero.com' });
  const decoded = tokenService.verifyToken(vendorToken);
  assert(decoded.id === 'user-vendor-1' && decoded.role === ROLES.VENDOR, 'TokenService encodes and decodes JWT with RBAC role');

  // 4. HTTP Middleware & RBAC
  console.log('\n[4] HTTP Middleware & RBAC Verification:');

  // 4a. Validate Middleware
  const mockReqValid = { body: { name: 'Valid User', email: 'valid@axlero.com', password: 'password123' } };
  let validateSuccess = false;
  validate(registerSchema)(mockReqValid, {}, () => { validateSuccess = true; });
  assert(validateSuccess, 'Zod validate middleware passes valid registration body');

  let validateFailedStatus = 0;
  const mockResFail = { status(c) { validateFailedStatus = c; return { json() {} }; } };
  validate(registerSchema)({ body: { name: 'V', email: 'invalid-email', password: '12' } }, mockResFail, () => {});
  assert(validateFailedStatus === 400, 'Zod validate middleware rejects malformed body with 400 Bad Request');

  // 4b. Auth Middleware
  const authMiddleware = createAuthMiddleware(tokenService);
  let authPass = false;
  const reqWithToken = { headers: { authorization: `Bearer ${vendorToken}` } };
  authMiddleware(reqWithToken, {}, () => { authPass = true; });
  assert(authPass && reqWithToken.user.role === ROLES.VENDOR, 'Auth middleware verifies Bearer token and sets req.user');

  let authFailStatus = 0;
  authMiddleware({ headers: {} }, { status(c) { authFailStatus = c; return { json() {} }; } }, () => {});
  assert(authFailStatus === 401, 'Auth middleware rejects request missing Authorization header with 401');

  // 4c. RBAC Middleware
  const rbacVendorGuard = authorize(ROLES.VENDOR, ROLES.ADMIN);
  let rbacVendorPass = false;
  rbacVendorGuard({ user: { role: ROLES.VENDOR } }, {}, () => { rbacVendorPass = true; });
  assert(rbacVendorPass, 'RBAC middleware permits VENDOR accessing vendor route');

  let rbacDenyStatus = 0;
  const mockDenyRes = { status(c) { rbacDenyStatus = c; return { json() {} }; } };
  rbacVendorGuard({ user: { role: ROLES.CUSTOMER } }, mockDenyRes, () => {});
  assert(rbacDenyStatus === 403, 'RBAC middleware forbids CUSTOMER from accessing vendor route with 403');

  // 5. Express App Routes Mounting
  console.log('\n[5] Express Application & Route Mounting:');
  assert(typeof app === 'function', 'Express app initialized successfully');
  assert(Boolean(app.router || app._router), 'Express app loaded middleware and route stacks');

  console.log('\n' + '='.repeat(65));
  console.log(`SUMMARY: ${passed}/${total} checks passed successfully.`);
  console.log('='.repeat(65));
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
