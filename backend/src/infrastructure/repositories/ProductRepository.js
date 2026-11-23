const ProductModel = require('../models/ProductModel');
const { Product } = require('../../domain/entities/Product');

class ProductRepository {
  constructor(model = ProductModel) {
    this.model = model;
  }

  _toEntity(doc) {
    if (!doc) return null;
    const vendorId = doc.vendorId?._id ? doc.vendorId._id.toString() : doc.vendorId?.toString();
    const vendorName = doc.vendorId?.name || null;

    return new Product({
      id: doc._id.toString(),
      vendorId,
      vendorName,
      title: doc.title,
      description: doc.description,
      price: doc.price,
      stock: doc.stock,
      category: doc.category,
      imageUrl: doc.imageUrl || '',
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(productData) {
    const doc = await this.model.create(productData);
    return this._toEntity(doc);
  }

  async findById(id) {
    const doc = await this.model.findById(id).populate('vendorId', 'name email');
    return this._toEntity(doc);
  }

  async findByVendorId(vendorId, { status, limit = 50, skip = 0 } = {}) {
    const query = { vendorId };
    if (status) query.status = status;
    const docs = await this.model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    return docs.map((doc) => this._toEntity(doc));
  }

  async findAll({
    category,
    minPrice,
    maxPrice,
    vendorId,
    search,
    status = 'active',
    inStockOnly = true,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = {}) {
    const query = {};

    if (status) query.status = status;
    if (inStockOnly) query.stock = { $gt: 0 };
    if (vendorId) query.vendorId = vendorId;

    if (category && category !== 'ALL') {
      query.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { category: searchRegex }];
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      stock_desc: { stock: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .populate('vendorId', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      this.model.countDocuments(query),
    ]);

    return {
      products: docs.map((doc) => this._toEntity(doc)),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async update(id, vendorId, updateData) {
    const query = { _id: id };
    if (vendorId) query.vendorId = vendorId; // vendor isolation check
    const doc = await this.model.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return this._toEntity(doc);
  }

  async delete(id, vendorId) {
    const query = { _id: id };
    if (vendorId) query.vendorId = vendorId; // vendor isolation check
    const result = await this.model.findOneAndDelete(query);
    return Boolean(result);
  }

  async countByVendor(vendorId, filter = {}) {
    return this.model.countDocuments({ vendorId, ...filter });
  }
}

module.exports = ProductRepository;
