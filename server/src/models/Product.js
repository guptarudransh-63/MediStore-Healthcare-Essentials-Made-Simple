import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    barcode: {
      type: String,
      default: '',
      trim: true
    },
    genericName: {
      type: String,
      default: '',
      trim: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    activeIngredient: {
      type: String,
      default: ''
    },
    strength: {
      type: String,
      default: ''
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Cream', 'Drops', 'Inhaler', 'Powder', 'Device', 'Kit', 'Other'],
      default: 'Tablet'
    },
    packSize: {
      type: String,
      default: '10 Tablets/Strip'
    },
    images: [
      {
        type: String
      }
    ],
    prescriptionClassification: {
      type: String,
      enum: ['rx_required', 'non_prescription', 'restricted'],
      default: 'non_prescription'
    },
    storageRequirements: {
      type: String,
      default: 'Store in a cool and dry place away from direct sunlight.'
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      default: 0
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 12 // Standard Indian GST rate for pharmaceuticals
    },
    hsnCode: {
      type: String,
      default: '3004'
    },
    reorderThreshold: {
      type: Number,
      default: 15
    },
    totalAvailableStock: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ name: 'text', genericName: 'text', brand: 'text', activeIngredient: 'text' });

export const Product = mongoose.model('Product', productSchema);
