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
const { validate, registerSchema, loginSchema, createProductSchema } = require('../src/interfaces/middleware/validate');
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
    imageUrl: '/uploads/products/earbuds.jpg',
  });
  assert(product.isInStock() === true, 'Product entity correctly reports in-stock status');
  assert(product.imageUrl === '/uploads/products/earbuds.jpg', 'Product entity stores and returns imageUrl');
  product.decreaseStock(5);
  assert(product.stock === 10, 'Product stock decreases correctly from 15 to 10');

  // 2. Mongoose Schemas
  console.log('\n[2] Infrastructure Mongoose Models:');
  assert(typeof UserModel.schema === 'object', 'UserModel Mongoose schema loaded');
  assert(typeof ProductModel.schema === 'object', 'ProductModel Mongoose schema loaded');
  assert(ProductModel.schema.paths.imageUrl !== undefined, 'ProductModel schema includes imageUrl field');

  // 3. Security Layer
  console.log('\n[3] Security Layer:');
  const hasher = new PasswordHasher(8);
  const plainPass = 'VendorSecurePass#2026';
  const hashed = await hasher.hash(plainPass);
  const isMatch = await hasher.compare(plainPass, hashed);
  assert(isMatch === true, 'PasswordHasher securely hashes and compares passwords');

  const tokenService = new TokenService('jwt_secret_key_with_at_least_32_characters_long_for_test', '2h');
  const vendorToken = tokenService.generateToken({ id: 'user-vendor-1', role: ROLES.VENDOR, email: 'vendor@axlero.com' });
  const decoded = tokenService.verifyToken(vendorToken);
  assert(decoded.id === 'user-vendor-1' && decoded.role === ROLES.VENDOR, 'TokenService encodes and decodes JWT with RBAC role');

  // 4. HTTP Middleware & RBAC
  console.log('\n[4] HTTP Middleware & RBAC Verification:');
  const mockReqValid = { body: { name: 'Valid User', email: 'valid@axlero.com', password: 'password123' } };
  let validateSuccess = false;
  validate(registerSchema)(mockReqValid, {}, () => { validateSuccess = true; });
  assert(validateSuccess, 'Zod validate middleware passes valid registration body');

  const mockProductValid = { body: { title: 'Smartphone', price: '499.99', stock: '25', category: 'Mobile' } };
  let productValidateSuccess = false;
  validate(createProductSchema)(mockProductValid, {}, () => { productValidateSuccess = true; });
  assert(productValidateSuccess && mockProductValid.body.price === 499.99, 'Zod validate parses and coerces product multipart numbers');

  const authMiddleware = createAuthMiddleware(tokenService);
  let authPass = false;
  const reqWithToken = { headers: { authorization: `Bearer ${vendorToken}` } };
  authMiddleware(reqWithToken, {}, () => { authPass = true; });
  assert(authPass && reqWithToken.user.role === ROLES.VENDOR, 'Auth middleware verifies Bearer token and sets req.user');

  const rbacVendorGuard = authorize(ROLES.VENDOR, ROLES.ADMIN);
  let rbacVendorPass = false;
  rbacVendorGuard({ user: { role: ROLES.VENDOR } }, {}, () => { rbacVendorPass = true; });
  assert(rbacVendorPass, 'RBAC middleware permits VENDOR accessing vendor route');

  let rbacDenyStatus = 0;
  rbacVendorGuard({ user: { role: ROLES.CUSTOMER } }, { status(c) { rbacDenyStatus = c; return { json() {} }; } }, () => {});
  assert(rbacDenyStatus === 403, 'RBAC middleware forbids CUSTOMER from accessing vendor route with 403');

  // 5. Vendor Isolation & Product Service
  console.log('\n[5] Multi-Vendor Isolation Verification:');
  const mockDb = [];
  const mockProductRepo = {
    async create(data) {
      const p = new Product({ id: `p-${mockDb.length + 1}`, ...data });
      mockDb.push(p);
      return p;
    },
    async findById(id) {
      return mockDb.find((p) => p.id === id) || null;
    },
    async findByVendorId(vendorId) {
      return mockDb.filter((p) => p.vendorId === vendorId);
    },
    async update(id, vendorId, updateData) {
      const p = mockDb.find((item) => item.id === id && item.vendorId === vendorId);
      if (!p) return null;
      Object.assign(p, updateData);
      return p;
    },
    async delete(id, vendorId) {
      const idx = mockDb.findIndex((item) => item.id === id && item.vendorId === vendorId);
      if (idx === -1) return false;
      mockDb.splice(idx, 1);
      return true;
    },
  };

  const productService = new ProductService({ productRepository: mockProductRepo });

  // Vendor 1 creates product
  const v1Product = await productService.createProduct('vendor-1', {
    title: 'Vendor 1 Shoes',
    price: 89.99,
    stock: 20,
    category: 'Footwear',
  });
  assert(v1Product.vendorId === 'vendor-1', 'Product created and linked to Vendor 1');

  // Vendor 2 attempts to edit Vendor 1's product -> must fail!
  let crossVendorEditBlocked = false;
  try {
    await productService.updateProduct(v1Product.id, 'vendor-2', { price: 10 });
  } catch (err) {
    crossVendorEditBlocked = err.statusCode === 404;
  }
  assert(crossVendorEditBlocked, 'Multi-vendor isolation: Vendor 2 blocked from editing Vendor 1 product');

  // Vendor 2 attempts to delete Vendor 1's product -> must fail!
  let crossVendorDeleteBlocked = false;
  try {
    await productService.deleteProduct(v1Product.id, 'vendor-2');
  } catch (err) {
    crossVendorDeleteBlocked = err.statusCode === 404;
  }
  assert(crossVendorDeleteBlocked, 'Multi-vendor isolation: Vendor 2 blocked from deleting Vendor 1 product');

  // Vendor 1 updates their own product -> must succeed!
  const updatedProduct = await productService.updateProduct(v1Product.id, 'vendor-1', { price: 79.99 });
  assert(updatedProduct.price === 79.99, 'Vendor 1 successfully updates own product');

  // 6. Express App & Documentation Assets
  console.log('\n[6] Express App & Documentation Assets:');
  assert(typeof app === 'function', 'Express app initialized successfully');
  assert(Boolean(app.router || app._router), 'Express app loaded middleware and route stacks');

  const openapi = require('../docs/openapi.json');
  const postman = require('../docs/postman_collection.json');
  const totalPostmanRequests = postman.item.reduce(
    (acc, it) => acc + (Array.isArray(it.item) ? it.item.length : 1),
    0
  );
  assert(openapi.openapi.startsWith('3.') && Object.keys(openapi.paths).length >= 5, 'OpenAPI 3.0 specification contains documented routes');
  assert(Boolean(postman.info.name) && totalPostmanRequests >= 8, 'Postman Collection v2.1 contains test request suite');

  console.log('\n' + '='.repeat(65));
  console.log(`SUMMARY: ${passed}/${total} checks passed successfully.`);
  console.log('='.repeat(65));
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
