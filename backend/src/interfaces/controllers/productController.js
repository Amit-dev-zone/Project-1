class ProductController {
  constructor({ productService }) {
    this.productService = productService;

    this.createProduct = this.createProduct.bind(this);
    this.getVendorProducts = this.getVendorProducts.bind(this);
    this.getProductById = this.getProductById.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
  }

  async createProduct(req, res, next) {
    try {
      const vendorId = req.user.id;
      const { title, description, price, stock, category, status } = req.body;

      const imageUrl = req.file
        ? `/uploads/products/${req.file.filename}`
        : req.body.imageUrl || '';

      const productData = {
        title,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        imageUrl,
        ...(status && { status }),
      };

      const product = await this.productService.createProduct(vendorId, productData);

      res.status(201).json({
        success: true,
        message: 'Product listing created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVendorProducts(req, res, next) {
    try {
      const vendorId = req.user.id;
      const { status, limit, skip } = req.query;

      const products = await this.productService.getVendorProducts(vendorId, {
        status,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const vendorId = req.user.id;
      const { title, description, price, stock, category, status } = req.body;

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = Number(price);
      if (stock !== undefined) updateData.stock = Number(stock);
      if (category !== undefined) updateData.category = category;
      if (status !== undefined) updateData.status = status;

      if (req.file) {
        updateData.imageUrl = `/uploads/products/${req.file.filename}`;
      } else if (req.body.imageUrl !== undefined) {
        updateData.imageUrl = req.body.imageUrl;
      }

      const product = await this.productService.updateProduct(id, vendorId, updateData);

      res.status(200).json({
        success: true,
        message: 'Product listing updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const vendorId = req.user.id;

      const result = await this.productService.deleteProduct(id, vendorId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
