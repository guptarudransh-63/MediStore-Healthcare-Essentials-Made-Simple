import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { syncProductTotalStock } from '../services/fefoAllocationService.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      classification,
      dosageForm,
      inStockOnly,
      sort = '-createdAt',
      page = 1,
      limit = 24
    } = req.query;

    const query = {};

    // For public customers, only show published products
    if (!req.user || req.user.role === 'customer') {
      query.isPublished = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { activeIngredient: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) query.category = cat._id;
      }
    }

    if (classification) {
      query.prescriptionClassification = classification;
    }

    if (dosageForm) {
      query.dosageForm = dosageForm;
    }

    if (inStockOnly === 'true') {
      query.totalAvailableStock = { $gt: 0 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Always ensure stock count reflects active, non-expired batches
    const currentStock = await syncProductTotalStock(product._id);
    product.totalAvailableStock = currentStock;

    let responseData = {
      product
    };

    // If staff/admin is viewing, also include non-expired batches breakdown
    if (req.user && ['admin', 'pharmacist'].includes(req.user.role)) {
      const batches = await InventoryBatch.find({
        product: product._id
      }).populate('supplier', 'name').sort({ expiryDate: 1 });
      responseData.batches = batches;
    }

    res.json({
      success: true,
      ...responseData
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      barcode,
      genericName,
      brand,
      manufacturer,
      category,
      description,
      activeIngredient,
      strength,
      dosageForm,
      packSize,
      images,
      prescriptionClassification,
      storageRequirements,
      sellingPrice,
      mrp,
      purchasePrice,
      taxRate,
      hsnCode,
      reorderThreshold,
      isPublished
    } = req.body;

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      name,
      slug,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode,
      genericName,
      brand,
      manufacturer,
      category,
      description,
      activeIngredient,
      strength,
      dosageForm,
      packSize,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'],
      prescriptionClassification: prescriptionClassification || 'non_prescription',
      storageRequirements,
      sellingPrice,
      mrp: mrp || sellingPrice,
      purchasePrice,
      taxRate: taxRate || 12,
      hsnCode: hsnCode || '3004',
      reorderThreshold: reorderThreshold || 15,
      isPublished: isPublished !== undefined ? isPublished : true,
      totalAvailableStock: 0
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await syncProductTotalStock(product._id);

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Soft delete / archive
    product.isPublished = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product archived successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('displayOrder name');
    
    // Add product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id, isPublished: true });
        return {
          ...cat.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, displayOrder } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || 'Pill',
      displayOrder: displayOrder || 0
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};
