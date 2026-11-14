const TokenService = require('../../infrastructure/security/TokenService');

const defaultTokenService = new TokenService();

const createAuthMiddleware = (tokenService = defaultTokenService) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: No authentication token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = tokenService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      const isExpired = error.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired ? 'Authentication token has expired' : 'Invalid authentication token',
      });
    }
  };
};

const auth = createAuthMiddleware();

module.exports = {
  auth,
  createAuthMiddleware,
};
