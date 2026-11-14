const UserModel = require('./infrastructure/models/UserModel');
const ProductModel = require('./infrastructure/models/ProductModel');

const UserRepository = require('./infrastructure/repositories/UserRepository');
const ProductRepository = require('./infrastructure/repositories/ProductRepository');

const PasswordHasher = require('./infrastructure/security/PasswordHasher');
const TokenService = require('./infrastructure/security/TokenService');

const UserService = require('./application/services/UserService');
const ProductService = require('./application/services/ProductService');

const AuthController = require('./interfaces/controllers/authController');

// 1. Instantiate Infrastructure & Security
const passwordHasher = new PasswordHasher();
const tokenService = new TokenService();

const userRepository = new UserRepository(UserModel);
const productRepository = new ProductRepository(ProductModel);

// 2. Instantiate Application Services
const userService = new UserService({
  userRepository,
  passwordHasher,
  tokenService,
});

const productService = new ProductService({
  productRepository,
});

// 3. Instantiate Controllers
const authController = new AuthController({
  userService,
});

module.exports = {
  userRepository,
  productRepository,
  passwordHasher,
  tokenService,
  userService,
  productService,
  authController,
};
