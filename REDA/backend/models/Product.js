const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'مواد غذائية',
        'منتجات الألبان',
        'مواد التنظيف',
        'العناية الشخصية',
        'حفاضات ومستلزمات الأطفال',
        'مشروبات',
        'حلويات وبسكويت',
        'أخرى'
      ]
    },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'الوحدة' }, // ex: الكيلو، اللتر، العلبة
    description: { type: String, default: '' },
    image: { type: String, default: '' }, // base64 ou URL
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
