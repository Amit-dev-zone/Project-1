class AuthController {
  constructor({ userService }) {
    this.userService = userService;

    // Bind methods to maintain `this` context when passed to Express route handlers
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.getVendorDashboard = this.getVendorDashboard.bind(this);
    this.getAdminDashboard = this.getAdminDashboard.bind(this);
  }

  async register(req, res, next) {
    try {
      const result = await this.userService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.userService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await this.userService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  getVendorDashboard(req, res) {
    res.status(200).json({
      success: true,
      message: 'Access granted to Vendor Dashboard',
      data: {
        vendorId: req.user.id,
        role: req.user.role,
        scope: 'vendor_isolated_catalog',
      },
    });
  }

  getAdminDashboard(req, res) {
    res.status(200).json({
      success: true,
      message: 'Access granted to Platform Admin Operations',
      data: {
        adminId: req.user.id,
        role: req.user.role,
        scope: 'platform_wide_governance',
      },
    });
  }
}

module.exports = AuthController;
