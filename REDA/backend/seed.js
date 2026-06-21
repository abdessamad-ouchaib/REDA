// Ce script crée le compte admin (à partir de .env) et quelques produits de démonstration.
// Lancez-le une seule fois avec: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Product = require('./models/Product');

const sampleProducts = [
  { name: 'زيت عباد الشمس', category: 'مواد غذائية', price: 22, unit: 'لتر', inStock: true },
  { name: 'حليب طازج', category: 'منتجات الألبان', price: 7.5, unit: 'لتر', inStock: true },
  { name: 'سكر مكرر', category: 'مواد غذائية', price: 12, unit: 'كيلو', inStock: true },
  { name: 'مسحوق غسيل', category: 'مواد التنظيف', price: 35, unit: 'علبة', inStock: true },
  { name: 'مناديل ورقية', category: 'مواد التنظيف', price: 18, unit: 'حزمة', inStock: true },
  { name: 'حفاضات أطفال', category: 'حفاضات ومستلزمات الأطفال', price: 65, unit: 'علبة', inStock: true },
  { name: 'مشروب غازي', category: 'مشروبات', price: 6, unit: 'قنينة', inStock: true },
  { name: 'بسكويت', category: 'حلويات وبسكويت', price: 9, unit: 'علبة', inStock: true }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB pour le seed');

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`ℹ️ Le compte admin "${username}" existe déjà, aucune action.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ username, passwordHash });
    console.log(`✅ Compte admin créé -> identifiant: "${username}" / mot de passe: "${password}"`);
  }

  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(sampleProducts);
    console.log(`✅ ${sampleProducts.length} produits de démonstration ajoutés.`);
  } else {
    console.log('ℹ️ Des produits existent déjà, aucun produit de démonstration ajouté.');
  }

  await mongoose.disconnect();
  console.log('🏁 Terminé.');
}

seed().catch((err) => {
  console.error('❌ Erreur pendant le seed:', err);
  process.exit(1);
});
