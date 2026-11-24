import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { Supplier } from '../models/Supplier.js';
import { StockReceipt } from '../models/StockReceipt.js';
import { Prescription } from '../models/Prescription.js';
import { Order } from '../models/Order.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { syncProductTotalStock } from '../services/fefoAllocationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const samplePrescriptionSamplePath = path.join(__dirname, '../../uploads/prescriptions/sample-rx-demo.png');
// Create dummy prescription placeholder file if not exists
if (!fs.existsSync(path.dirname(samplePrescriptionSamplePath))) {
  fs.mkdirSync(path.dirname(samplePrescriptionSamplePath), { recursive: true });
}
if (!fs.existsSync(samplePrescriptionSamplePath)) {
  fs.writeFileSync(samplePrescriptionSamplePath, 'Sample Demo Prescription File Buffer');
}

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medistore');
    console.log('[Seed] Connected.');

    // Clear existing collections
    console.log('[Seed] Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      InventoryBatch.deleteMany({}),
      Supplier.deleteMany({}),
      StockReceipt.deleteMany({}),
      Prescription.deleteMany({}),
      Order.deleteMany({}),
      InventoryMovement.deleteMany({})
    ]);

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'Dr. Rajesh Sharma (Lead Pharmacist & Admin)',
      email: 'admin@medistore.health',
      password: 'Password@123',
      role: 'admin',
      phone: '+91 98111 22334',
      address: {
        street: '42 Medical Plaza, Sector 18',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122001'
      }
    });

    const pharmacistUser = await User.create({
      name: 'Priya Verma (Registered Pharmacist)',
      email: 'pharmacist@medistore.health',
      password: 'Password@123',
      role: 'pharmacist',
      phone: '+91 98222 33445',
      address: {
        street: '15 Pharmacy Heights, DLF Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002'
      }
    });

    const demoCustomer = await User.create({
      name: 'Amit Patel',
      email: 'customer@medistore.health',
      password: 'Password@123',
      role: 'customer',
      phone: '+91 98765 43210',
      address: {
        street: 'Tower B, Flat 402, Green Valley Apts',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122003',
        landmark: 'Near Cyber City'
      }
    });

    const customer2 = await User.create({
      name: 'Ananya Deshmukh',
      email: 'ananya.d@example.com',
      password: 'Password@123',
      role: 'customer',
      phone: '+91 98456 78901',
      address: {
        street: 'B-12, Sector 45',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122003'
      }
    });

    // 2. Create Suppliers
    console.log('[Seed] Creating suppliers...');
    const suppliers = await Supplier.create([
      {
        name: 'Sun Biotech Distributors Ltd.',
        contactPerson: 'Suresh Menon',
        email: 'orders@sunbiotech.example.com',
        phone: '+91 11 2541 8900',
        address: { street: 'Industrial Area Phase 1', city: 'New Delhi', state: 'Delhi', postalCode: '110020' },
        gstin: '07AAACS1234F1Z1',
        dlNumber: 'DL-ND-2023-9988'
      },
      {
        name: 'Cipla Healthcare Logistics',
        contactPerson: 'Rohan Deshpande',
        email: 'supply@ciplalogistics.example.com',
        phone: '+91 22 6789 0123',
        address: { street: 'Bhiwandi Pharma Hub', city: 'Thane', state: 'Maharashtra', postalCode: '421302' },
        gstin: '27AABCC5678G1Z2',
        dlNumber: 'DL-MH-2022-7711'
      },
      {
        name: 'MedPlus Wholesale Supplies',
        contactPerson: 'Kavita Reddy',
        email: 'distrib@medplusws.example.com',
        phone: '+91 40 4567 8900',
        address: { street: 'IDA Bollaram', city: 'Hyderabad', state: 'Telangana', postalCode: '502325' },
        gstin: '36AABCM9012H1Z3',
        dlNumber: 'DL-TG-2024-5544'
      }
    ]);

    // 3. Create Categories
    console.log('[Seed] Creating categories...');
    const categoriesData = [
      { name: 'Prescription Medicines', slug: 'prescription-medicines', icon: 'FileText', description: 'Certified pharmaceuticals requiring registered doctor prescription.', displayOrder: 1 },
      { name: 'Over-the-Counter Medicines', slug: 'over-the-counter-medicines', icon: 'Pill', description: 'Pain relief, fever, cold, allergy, and digestive aids available without prescription.', displayOrder: 2 },
      { name: 'First Aid & Surgical', slug: 'first-aid', icon: 'ShieldAlert', description: 'Bandages, antiseptic lotions, wound dressings, and emergency kits.', displayOrder: 3 },
      { name: 'Medical Devices', slug: 'medical-devices', icon: 'Activity', description: 'BP monitors, glucometers, nebulizers, thermometers, and pulse oximeters.', displayOrder: 4 },
      { name: 'Health Supplements', slug: 'health-supplements', icon: 'Zap', description: 'Vitamins, minerals, calcium, immunity boosters, and protein supplements.', displayOrder: 5 },
      { name: 'Personal Care', slug: 'personal-care', icon: 'Sparkles', description: 'Skin care, hair care, oral hygiene, and sun protection products.', displayOrder: 6 },
      { name: 'Baby Care', slug: 'baby-care', icon: 'HeartHandshake', description: 'Baby food, diapers, gentle washes, and pediatrician-recommended wipes.', displayOrder: 7 },
      { name: 'Hygiene & Wellness', slug: 'hygiene-wellness', icon: 'Heart', description: 'Sanitizers, disinfectants, respiratory masks, and herbal teas.', displayOrder: 8 }
    ];

    const categories = await Category.create(categoriesData);
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    // 4. Create 32 Realistic Products
    console.log('[Seed] Creating products catalogue...');
    const rawProducts = [
      // Prescription Medicines
      {
        name: 'Augmentin 625 Duo Tablet',
        sku: 'AUG-625-TAB',
        barcode: '8901036001234',
        genericName: 'Amoxicillin & Potassium Clavulanate Tablets IP',
        brand: 'Augmentin',
        manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
        category: catMap['prescription-medicines'],
        activeIngredient: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
        strength: '625mg',
        dosageForm: 'Tablet',
        packSize: '10 Tablets/Strip',
        sellingPrice: 204.50,
        purchasePrice: 155.00,
        mrp: 220.00,
        taxRate: 12,
        prescriptionClassification: 'rx_required',
        storageRequirements: 'Store below 25°C in a dry place. Protect from moisture.',
        description: 'Augmentin 625 Duo Tablet is a penicillin-type antibiotic used to treat bacterial infections of the lungs, airways, ear, urinary tract, skin, and soft tissue.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Azithral 500 Tablet',
        sku: 'AZI-500-TAB',
        barcode: '8901036001235',
        genericName: 'Azithromycin Tablets IP',
        brand: 'Azithral',
        manufacturer: 'Alembic Pharmaceuticals Ltd',
        category: catMap['prescription-medicines'],
        activeIngredient: 'Azithromycin Dihydrate eq. to Azithromycin 500mg',
        strength: '500mg',
        dosageForm: 'Tablet',
        packSize: '5 Tablets/Strip',
        sellingPrice: 119.50,
        purchasePrice: 85.00,
        mrp: 132.00,
        taxRate: 12,
        prescriptionClassification: 'rx_required',
        storageRequirements: 'Store in a dry place below 30°C.',
        description: 'Broad-spectrum macrolide antibiotic commonly prescribed for upper respiratory tract infections, tonsillitis, sinusitis, and skin infections.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Glycomet-GP 1 Tablet',
        sku: 'GLY-GP1-TAB',
        barcode: '8901036001236',
        genericName: 'Glimepiride & Metformin Hydrochloride Tablets',
        brand: 'Glycomet',
        manufacturer: 'USV Private Limited',
        category: catMap['prescription-medicines'],
        activeIngredient: 'Glimepiride 1mg + Metformin Hydrochloride 500mg PR',
        strength: '1mg/500mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets/Strip',
        sellingPrice: 135.00,
        purchasePrice: 95.00,
        mrp: 152.00,
        taxRate: 12,
        prescriptionClassification: 'rx_required',
        storageRequirements: 'Store in a cool, dry place. Protect from light.',
        description: 'Combination anti-diabetic medication indicated as second-line treatment of type 2 diabetes mellitus when diet, exercise and initial drugs are insufficient.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Telma 40 Tablet',
        sku: 'TEL-40-TAB',
        barcode: '8901036001237',
        genericName: 'Telmisartan Tablets IP',
        brand: 'Telma',
        manufacturer: 'Glenmark Pharmaceuticals Ltd',
        category: catMap['prescription-medicines'],
        activeIngredient: 'Telmisartan 40mg',
        strength: '40mg',
        dosageForm: 'Tablet',
        packSize: '30 Tablets/Pack',
        sellingPrice: 220.00,
        purchasePrice: 160.00,
        mrp: 245.00,
        taxRate: 12,
        prescriptionClassification: 'rx_required',
        storageRequirements: 'Store below 25°C. Protect from moisture and heat.',
        description: 'Angiotensin receptor blocker (ARB) used in the management of essential hypertension and to reduce cardiovascular morbidity.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Atorva 20 Tablet',
        sku: 'ATO-20-TAB',
        barcode: '8901036001238',
        genericName: 'Atorvastatin Calcium Tablets IP',
        brand: 'Atorva',
        manufacturer: 'Zydus Lifesciences Ltd',
        category: catMap['prescription-medicines'],
        activeIngredient: 'Atorvastatin 20mg',
        strength: '20mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets/Strip',
        sellingPrice: 185.00,
        purchasePrice: 130.00,
        mrp: 210.00,
        taxRate: 12,
        prescriptionClassification: 'rx_required',
        storageRequirements: 'Store protected from moisture at a temperature not exceeding 30°C.',
        description: 'Statin lipid-lowering medication that helps lower bad cholesterol (LDL) and triglycerides while raising good cholesterol (HDL).',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Pantocid 40 Tablet',
        sku: 'PAN-40-TAB',
        barcode: '8901036001239',
        genericName: 'Pantoprazole Gastro-resistant Tablets IP',
        brand: 'Pantocid',
        manufacturer: 'Sun Pharmaceutical Industries Ltd',
        category: catMap['prescription-medicines'],
        activeIngredient: 'Pantoprazole Sodium Sesquihydrate eq. to Pantoprazole 40mg',
        strength: '40mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets/Strip',
        sellingPrice: 155.00,
        purchasePrice: 108.00,
        mrp: 172.00,
        taxRate: 12,
        prescriptionClassification: 'rx_required',
        storageRequirements: 'Store in a cool dry place below 25°C. Do not crush or chew.',
        description: 'Proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach. Indicated for GERD, reflux esophagitis, and peptic ulcers.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },

      // Over the Counter Medicines
      {
        name: 'Dolo 650 Tablet',
        sku: 'DOL-650-TAB',
        barcode: '8901036002001',
        genericName: 'Paracetamol Tablets IP 650mg',
        brand: 'Dolo',
        manufacturer: 'Micro Labs Limited',
        category: catMap['over-the-counter-medicines'],
        activeIngredient: 'Paracetamol 650mg',
        strength: '650mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets/Strip',
        sellingPrice: 33.60,
        purchasePrice: 24.00,
        mrp: 35.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store protected from light and moisture at a temperature not exceeding 30°C.',
        description: 'Trusted antipyretic and analgesic for effective relief from mild to moderate body pain, headache, dental pain, and fever.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Crocin Pain Relief Tablet',
        sku: 'CRO-PR-TAB',
        barcode: '8901036002002',
        genericName: 'Paracetamol & Caffeine Tablets',
        brand: 'Crocin',
        manufacturer: 'GlaxoSmithKline Consumer Healthcare',
        category: catMap['over-the-counter-medicines'],
        activeIngredient: 'Paracetamol 650mg + Caffeine 50mg',
        strength: '650mg/50mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets/Strip',
        sellingPrice: 65.00,
        purchasePrice: 48.00,
        mrp: 72.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in a dry place. Keep out of reach of children.',
        description: 'Fast acting pain relief formula combining paracetamol with caffeine to accelerate absorption for severe headache and joint pain.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Benadryl Cough Syrup',
        sku: 'BEN-100-SYR',
        barcode: '8901036002003',
        genericName: 'Diphenhydramine HCl, Ammonium Chloride & Sodium Citrate Syrup',
        brand: 'Benadryl',
        manufacturer: 'Johnson & Johnson Private Limited',
        category: catMap['over-the-counter-medicines'],
        activeIngredient: 'Diphenhydramine HCl 14.05mg / 5ml',
        strength: '100ml',
        dosageForm: 'Syrup',
        packSize: '100ml Bottle',
        sellingPrice: 128.00,
        purchasePrice: 94.00,
        mrp: 140.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store at room temperature away from direct sunlight.',
        description: 'Effective cough formula that provides soothing relief from dry cough, throat irritation, allergy sneezes, and runny nose.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Gelusil Antacid Liquid Mint',
        sku: 'GEL-200-LIQ',
        barcode: '8901036002004',
        genericName: 'Aluminium Hydroxide, Magnesium Hydroxide & Dimethicone Liquid',
        brand: 'Gelusil',
        manufacturer: 'Pfizer Products India Pvt Ltd',
        category: catMap['over-the-counter-medicines'],
        activeIngredient: 'Aluminium Hydroxide 0.291g + Magnesium Hydroxide 98mg + Simethicone 25mg',
        strength: '200ml',
        dosageForm: 'Syrup',
        packSize: '200ml Bottle',
        sellingPrice: 140.00,
        purchasePrice: 102.00,
        mrp: 154.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Shake well before use. Keep bottle tightly closed.',
        description: 'Sugar-free fast action antacid that gives quick and lasting relief from heartburn, acidity, gas bubbles, and stomach discomfort.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Otrivin Oxy Fast Relief Nasal Spray',
        sku: 'OTR-10-SPR',
        barcode: '8901036002005',
        genericName: 'Oxymetazoline Hydrochloride Nasal Solution USP 0.05%',
        brand: 'Otrivin',
        manufacturer: 'Haleon India Consumer Healthcare',
        category: catMap['over-the-counter-medicines'],
        activeIngredient: 'Oxymetazoline Hydrochloride 0.05% w/v',
        strength: '10ml',
        dosageForm: 'Drops',
        packSize: '10ml Spray Bottle',
        sellingPrice: 98.00,
        purchasePrice: 70.00,
        mrp: 110.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store below 30°C. Do not freeze.',
        description: 'Fast acting nasal decongestant spray that opens blocked nose in 25 seconds and provides breathing comfort up to 12 hours.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Cetriz 10 Tablet',
        sku: 'CET-10-TAB',
        barcode: '8901036002006',
        genericName: 'Cetirizine Hydrochloride Tablets IP',
        brand: 'Cetriz',
        manufacturer: 'Alkem Laboratories Ltd',
        category: catMap['over-the-counter-medicines'],
        activeIngredient: 'Cetirizine Hydrochloride 10mg',
        strength: '10mg',
        dosageForm: 'Tablet',
        packSize: '10 Tablets/Strip',
        sellingPrice: 21.00,
        purchasePrice: 14.00,
        mrp: 23.50,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in a cool dry place.',
        description: 'Second generation anti-allergic antihistamine for allergic rhinitis, watery eyes, itching, hives, and pollen allergies.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },

      // First Aid & Surgical
      {
        name: 'Betadine 10% Antiseptic Solution',
        sku: 'BET-100-SOL',
        barcode: '8901036003001',
        genericName: 'Povidone-Iodine Solution IP 10% w/v',
        brand: 'Betadine',
        manufacturer: 'Win-Medicare Pvt Ltd',
        category: catMap['first-aid'],
        activeIngredient: 'Povidone-Iodine 10% w/v (Available Iodine 1% w/v)',
        strength: '100ml',
        dosageForm: 'Drops',
        packSize: '100ml Bottle',
        sellingPrice: 135.00,
        purchasePrice: 98.00,
        mrp: 148.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in airtight containers below 25°C. Protect from light.',
        description: 'Topical microbicidal antiseptic solution for prevention and treatment of skin infections in minor burns, cuts, grazes, and abrasions.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Hansaplast Washproof Plasters',
        sku: 'HAN-20-PLA',
        barcode: '8901036003002',
        genericName: 'Adhesive Medicated Bandages',
        brand: 'Hansaplast',
        manufacturer: 'Beiersdorf India Pvt Ltd',
        category: catMap['first-aid'],
        activeIngredient: 'Medicated Pad with Benzalkonium Chloride',
        strength: '20 Strips',
        dosageForm: 'Kit',
        packSize: 'Pack of 20 Strips',
        sellingPrice: 55.00,
        purchasePrice: 38.00,
        mrp: 60.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in a clean and dry place.',
        description: 'Water resistant breathable adhesive bandages protecting small everyday wounds and grazes from dirt and bacteria.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Dettol Antiseptic Disinfectant Liquid',
        sku: 'DET-250-LIQ',
        barcode: '8901036003003',
        genericName: 'Chloroxylenol Antiseptic Liquid',
        brand: 'Dettol',
        manufacturer: 'Reckitt Benckiser Healthcare India Ltd',
        category: catMap['first-aid'],
        activeIngredient: 'Chloroxylenol 4.8% w/v',
        strength: '250ml',
        dosageForm: 'Kit',
        packSize: '250ml Bottle',
        sellingPrice: 154.00,
        purchasePrice: 118.00,
        mrp: 165.00,
        taxRate: 18,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store below 30°C. For external use only.',
        description: 'Trusted antiseptic disinfectant liquid protecting against 100 illness-causing germs for first aid, shaving, and laundry disinfection.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },

      // Medical Devices
      {
        name: 'Omron HEM-7120 Digital Blood Pressure Monitor',
        sku: 'OMR-BP-7120',
        barcode: '8901036004001',
        genericName: 'Automatic Upper Arm Digital BP Monitor',
        brand: 'Omron',
        manufacturer: 'Omron Healthcare Co. Ltd',
        category: catMap['medical-devices'],
        activeIngredient: 'Intellisense Technology Sensor',
        strength: '1 Unit',
        dosageForm: 'Device',
        packSize: '1 Device with Medium Cuff & Batteries',
        sellingPrice: 1980.00,
        purchasePrice: 1450.00,
        mrp: 2450.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Keep away from high humidity, direct sunlight, and magnetic fields.',
        description: 'Clinically validated automatic blood pressure monitor featuring Intellisense technology, hypertension indicator, and body movement detection.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Accu-Chek Active Blood Glucose Monitor Kit',
        sku: 'ACC-GLU-KIT',
        barcode: '8901036004002',
        genericName: 'Self Monitoring Blood Glucose Meter Kit',
        brand: 'Accu-Chek',
        manufacturer: 'Roche Diabetes Care India Pvt Ltd',
        category: catMap['medical-devices'],
        activeIngredient: 'Electrochemical biosensor test strips',
        strength: '1 Kit (Meter + 10 Strips + Lancing Device)',
        dosageForm: 'Device',
        packSize: '1 Kit',
        sellingPrice: 1199.00,
        purchasePrice: 880.00,
        mrp: 1399.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store between -25°C to 70°C. Avoid damp areas.',
        description: 'Accurate and simple home blood glucose monitoring system providing results in 5 seconds with easy 2-button navigation.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Dr Trust USA Waterproof Digital Thermometer',
        sku: 'DRT-THE-DIG',
        barcode: '8901036004003',
        genericName: 'Flexible Tip Electronic Clinical Thermometer',
        brand: 'Dr Trust',
        manufacturer: 'Nureca Limited',
        category: catMap['medical-devices'],
        activeIngredient: 'High precision thermistor sensor',
        strength: '1 Unit',
        dosageForm: 'Device',
        packSize: '1 Unit with Protective Case',
        sellingPrice: 249.00,
        purchasePrice: 160.00,
        mrp: 350.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Clean probe with 70% ethanol after each use.',
        description: 'Quick read flexible tip digital clinical thermometer with fever alarm, memory recall, and dual °C/°F display.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Beurer PO 30 Fingertip Pulse Oximeter',
        sku: 'BEU-OXI-30',
        barcode: '8901036004004',
        genericName: 'Fingertip Pulse Oximeter',
        brand: 'Beurer',
        manufacturer: 'Beurer India Pvt Ltd',
        category: catMap['medical-devices'],
        activeIngredient: 'Dual-wavelength optical sensor',
        strength: '1 Unit',
        dosageForm: 'Device',
        packSize: '1 Unit with Lanyard & Batteries',
        sellingPrice: 1450.00,
        purchasePrice: 1050.00,
        mrp: 1890.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Keep dry and handle sensor with care.',
        description: 'Measures arterial oxygen saturation (SpO2) and heart rate (pulse) non-invasively on the finger with color OLED display.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },

      // Health Supplements
      {
        name: 'Becadexamin Softgel Capsules',
        sku: 'BEC-30-CAP',
        barcode: '8901036005001',
        genericName: 'Multivitamin and Multimineral Soft Gelatin Capsules',
        brand: 'Becadexamin',
        manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
        category: catMap['health-supplements'],
        activeIngredient: 'Vitamin A, D3, E, B-Complex & Minerals (Zinc, Copper)',
        strength: 'Standard Formula',
        dosageForm: 'Capsule',
        packSize: '30 Capsules/Bottle',
        sellingPrice: 52.00,
        purchasePrice: 38.00,
        mrp: 58.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in a dry place at or below 25°C.',
        description: 'Daily multivitamin and mineral supplement supporting overall vitality, cellular energy production, and nutritional replenishment.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Shelcal 500 Tablet',
        sku: 'SHE-500-TAB',
        barcode: '8901036005002',
        genericName: 'Calcium and Vitamin D3 Tablets IP',
        brand: 'Shelcal',
        manufacturer: 'Torrent Pharmaceuticals Ltd',
        category: catMap['health-supplements'],
        activeIngredient: 'Elemental Calcium 500mg + Vitamin D3 250 IU',
        strength: '500mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets/Strip',
        sellingPrice: 125.00,
        purchasePrice: 90.00,
        mrp: 142.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in a cool and dry place away from moisture.',
        description: 'High absorption calcium supplement fortified with Vitamin D3 to strengthen bone density, joint health, and muscle function.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Limcee 500mg Chewable Tablet',
        sku: 'LIM-500-TAB',
        barcode: '8901036005003',
        genericName: 'Ascorbic Acid and Sodium Ascorbate Chewable Tablets',
        brand: 'Limcee',
        manufacturer: 'Abbott Healthcare Pvt Ltd',
        category: catMap['health-supplements'],
        activeIngredient: 'Vitamin C 500mg (Ascorbic Acid 100mg + Sodium Ascorbate 450mg)',
        strength: '500mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets/Strip',
        sellingPrice: 28.50,
        purchasePrice: 19.00,
        mrp: 32.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Keep strip in aluminum foil until use. Protect from light.',
        description: 'Delicious orange flavored chewable Vitamin C that strengthens immune defense, aids collagen synthesis, and acts as an antioxidant.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Neurobion Forte Tablet',
        sku: 'NEU-FOR-TAB',
        barcode: '8901036005004',
        genericName: 'Vitamin B Complex with Vitamin B12 Tablets',
        brand: 'Neurobion',
        manufacturer: 'Procter & Gamble Hygiene and Health Care Ltd',
        category: catMap['health-supplements'],
        activeIngredient: 'Vitamin B1 (10mg) + B2 (10mg) + B3 (45mg) + B5 (50mg) + B6 (3mg) + B12 (15mcg)',
        strength: 'High Potency B-Complex',
        dosageForm: 'Tablet',
        packSize: '30 Tablets/Strip',
        sellingPrice: 42.00,
        purchasePrice: 29.00,
        mrp: 47.50,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store below 25°C in a dry place.',
        description: 'Specially formulated vitamin B complex to nourish nerves, relieve tingling sensations, and support healthy nervous system metabolism.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },

      // Personal Care
      {
        name: 'Sebamed Clear Face Cleansing Foam',
        sku: 'SEB-150-FOA',
        barcode: '8901036006001',
        genericName: 'pH 5.5 Anti-bacterial Cleansing Foam',
        brand: 'Sebamed',
        manufacturer: 'Sebapharma GmbH & USV Pvt Ltd',
        category: catMap['personal-care'],
        activeIngredient: 'Montaline C40 + Panthenol',
        strength: '150ml',
        dosageForm: 'Other',
        packSize: '150ml Pump Bottle',
        sellingPrice: 580.00,
        purchasePrice: 420.00,
        mrp: 650.00,
        taxRate: 18,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store below 25°C. For external use only.',
        description: 'Dermatologically tested cleansing foam formulated at natural pH 5.5 to combat pimples, blackheads, and skin impurities gently.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Cetaphil Gentle Skin Cleanser',
        sku: 'CET-250-CLE',
        barcode: '8901036006002',
        genericName: 'Hydrating Face & Body Cleanser for Sensitive Skin',
        brand: 'Cetaphil',
        manufacturer: 'Galderma India Pvt Ltd',
        category: catMap['personal-care'],
        activeIngredient: 'Niacinamide, Panthenol & Hydrating Glycerin',
        strength: '250ml',
        dosageForm: 'Other',
        packSize: '250ml Bottle',
        sellingPrice: 495.00,
        purchasePrice: 360.00,
        mrp: 555.00,
        taxRate: 18,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in cool place. Avoid freezing.',
        description: 'Soap-free and non-comedogenic gentle cleanser that removes impurities while maintaining skin moisture barrier for sensitive skin.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },

      // Baby Care
      {
        name: 'Pampers All Round Protection Pants (Large)',
        sku: 'PAM-L-56',
        barcode: '8901036007001',
        genericName: 'Baby Diaper Pants Large 9-14 kg',
        brand: 'Pampers',
        manufacturer: 'Procter & Gamble Home Products Pvt Ltd',
        category: catMap['baby-care'],
        activeIngredient: 'Absorbent gelling core with Aloe Vera lotion',
        strength: 'Size Large (56 Count)',
        dosageForm: 'Kit',
        packSize: 'Pack of 56 Diapers',
        sellingPrice: 899.00,
        purchasePrice: 680.00,
        mrp: 1099.00,
        taxRate: 12,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in a clean and dry place.',
        description: 'Up to 12 hours of leakage protection with anti-rash aloe vera lotion and comfortable 360-degree waist stretch.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Himalaya Gentle Baby Shampoo',
        sku: 'HIM-200-SHA',
        barcode: '8901036007002',
        genericName: 'No Tears Hibiscus & Chickpea Baby Shampoo',
        brand: 'Himalaya',
        manufacturer: 'The Himalaya Drug Company',
        category: catMap['baby-care'],
        activeIngredient: 'Chickpea, Hibiscus & Khus Grass',
        strength: '200ml',
        dosageForm: 'Other',
        packSize: '200ml Bottle',
        sellingPrice: 195.00,
        purchasePrice: 140.00,
        mrp: 220.00,
        taxRate: 18,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Store in a cool dry place.',
        description: 'No tears mild baby shampoo that gently cleanses delicate scalp, leaving baby hair soft, shiny, and manageable.',
        images: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60']
      },

      // Hygiene & Wellness
      {
        name: 'Lifebuoy Alcohol-Based Hand Sanitizer',
        sku: 'LIF-500-SAN',
        barcode: '8901036008001',
        genericName: 'Ethyl Alcohol Hand Sanitizer 70% v/v',
        brand: 'Lifebuoy',
        manufacturer: 'Hindustan Unilever Limited',
        category: catMap['hygiene-wellness'],
        activeIngredient: 'Ethyl Alcohol 70% v/v + Glycerin',
        strength: '500ml',
        dosageForm: 'Other',
        packSize: '500ml Pump Dispenser',
        sellingPrice: 180.00,
        purchasePrice: 120.00,
        mrp: 210.00,
        taxRate: 18,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Highly flammable. Keep away from heat, sparks, and flame.',
        description: 'Instant rinse-free hand sanitizer killing 99.99% germs and bacteria without water while moisturising with glycerin.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60']
      },
      {
        name: 'Wildcraft Supermask W95 Reusable Respirator',
        sku: 'WIL-W95-MSK',
        barcode: '8901036008002',
        genericName: '6-Layer Outdoor Respiratory Protection Mask',
        brand: 'Wildcraft',
        manufacturer: 'Wildcraft India Private Limited',
        category: catMap['hygiene-wellness'],
        activeIngredient: 'Meltblown electrostatic micro-filtration fabric',
        strength: 'Pack of 3',
        dosageForm: 'Device',
        packSize: 'Pack of 3 Masks',
        sellingPrice: 249.00,
        purchasePrice: 165.00,
        mrp: 300.00,
        taxRate: 5,
        prescriptionClassification: 'non_prescription',
        storageRequirements: 'Washable up to 30 gentle hand washes. Store in a clean pouch.',
        description: 'High performance engineered triple particulate filtration system with comfortable ear loops and breathing space.',
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60']
      }
    ];

    const products = [];
    for (const rp of rawProducts) {
      const slug = `${rp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const prod = await Product.create({
        ...rp,
        slug
      });
      products.push(prod);
    }
    console.log(`[Seed] Created ${products.length} products.`);

    // 5. Create Realistic Inventory Batches with Varied Expiry Dates
    console.log('[Seed] Creating batch-level inventory with realistic expiry timelines...');
    const now = new Date();

    const batchesToCreate = [];

    // Augmentin 625: Multiple batches (FEFO test case!)
    // Batch 1: Expiring in 20 days (Near expiry warning)
    batchesToCreate.push({
      product: products[0]._id,
      batchNumber: 'AUG-B2401',
      manufacturer: products[0].manufacturer,
      mfgDate: new Date(now.getTime() - 340 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days
      quantityReceived: 50,
      availableQuantity: 35,
      purchasePrice: 152.00,
      supplier: suppliers[0]._id,
      storageLocation: 'Shelf A-01 (Antibiotics)',
      batchStatus: 'active'
    });

    // Batch 2: Expiring in 18 months (Fresh safe stock)
    batchesToCreate.push({
      product: products[0]._id,
      batchNumber: 'AUG-B2508',
      manufacturer: products[0].manufacturer,
      mfgDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() + 540 * 24 * 60 * 60 * 1000), // ~18 months
      quantityReceived: 100,
      availableQuantity: 95,
      purchasePrice: 155.00,
      supplier: suppliers[0]._id,
      storageLocation: 'Shelf A-01 (Antibiotics)',
      batchStatus: 'active'
    });

    // Batch 3: Expired 15 days ago (For demonstration of quarantine & alert)
    batchesToCreate.push({
      product: products[0]._id,
      batchNumber: 'AUG-B2309',
      manufacturer: products[0].manufacturer,
      mfgDate: new Date(now.getTime() - 720 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // Expired!
      quantityReceived: 40,
      availableQuantity: 12, // 12 units at risk
      purchasePrice: 150.00,
      supplier: suppliers[0]._id,
      storageLocation: 'Quarantine Rack Q-1',
      batchStatus: 'expired',
      notes: 'Expired stock flagged for supplier return credit'
    });

    // Azithral 500: Expiring in 5 days (Critical near-expiry <7 days)
    batchesToCreate.push({
      product: products[1]._id,
      batchNumber: 'AZI-C109',
      manufacturer: products[1].manufacturer,
      mfgDate: new Date(now.getTime() - 355 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days!
      quantityReceived: 60,
      availableQuantity: 18,
      purchasePrice: 85.00,
      supplier: suppliers[1]._id,
      storageLocation: 'Shelf A-02',
      batchStatus: 'active'
    });

    // Azithral 500: Fresh stock
    batchesToCreate.push({
      product: products[1]._id,
      batchNumber: 'AZI-D204',
      manufacturer: products[1].manufacturer,
      mfgDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() + 450 * 24 * 60 * 60 * 1000),
      quantityReceived: 80,
      availableQuantity: 80,
      purchasePrice: 85.00,
      supplier: suppliers[1]._id,
      storageLocation: 'Shelf A-02',
      batchStatus: 'active'
    });

    // Dolo 650: Multiple large batches (High turnover)
    batchesToCreate.push({
      product: products[6]._id, // Dolo 650
      batchNumber: 'DOL-24K09',
      manufacturer: products[6].manufacturer,
      mfgDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() + 280 * 24 * 60 * 60 * 1000),
      quantityReceived: 500,
      availableQuantity: 340,
      purchasePrice: 24.00,
      supplier: suppliers[0]._id,
      storageLocation: 'Main Bay OTC-01',
      batchStatus: 'active'
    });

    // Low stock product: Omron BP Monitor (Only 4 left, below reorder threshold 15)
    batchesToCreate.push({
      product: products[15]._id, // Omron BP
      batchNumber: 'OMR-SN-9981',
      manufacturer: products[15].manufacturer,
      mfgDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() + 700 * 24 * 60 * 60 * 1000),
      quantityReceived: 10,
      availableQuantity: 4, // LOW STOCK!
      purchasePrice: 1450.00,
      supplier: suppliers[2]._id,
      storageLocation: 'Secure Cabinet Dev-01',
      batchStatus: 'active'
    });

    // Create batches for all remaining products
    for (let i = 2; i < products.length; i++) {
      if (i === 6 || i === 15) continue; // Already added custom batches

      const p = products[i];
      // Generate 1-2 batches per product
      const batchCode = `BTH-${p.sku.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expDays = i % 4 === 0 ? 45 : 365 + i * 20; // Some in 45 days, rest safe
      const qty = i % 5 === 0 ? 8 : 40 + (i * 3); // Some low stock

      batchesToCreate.push({
        product: p._id,
        batchNumber: batchCode,
        manufacturer: p.manufacturer,
        mfgDate: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(now.getTime() + expDays * 24 * 60 * 60 * 1000),
        quantityReceived: qty + 10,
        availableQuantity: qty,
        purchasePrice: p.purchasePrice,
        supplier: suppliers[i % suppliers.length]._id,
        storageLocation: `Rack ${String.fromCharCode(65 + (i % 6))}-${(i % 5) + 1}`,
        batchStatus: 'active'
      });
    }

    const createdBatches = await InventoryBatch.insertMany(batchesToCreate);
    console.log(`[Seed] Created ${createdBatches.length} inventory batches.`);

    // Record Stock In movements & Sync totalAvailableStock for each product
    for (const b of createdBatches) {
      await InventoryMovement.create({
        product: b.product,
        batch: b._id,
        movementType: 'stock_in',
        quantityChange: b.quantityReceived,
        previousQuantity: 0,
        newQuantity: b.quantityReceived,
        actor: adminUser._id,
        reason: 'Initial database seed stock receipt'
      });
    }

    for (const p of products) {
      await syncProductTotalStock(p._id);
    }
    console.log('[Seed] Stock synchronized with FEFO availability.');

    // 6. Create Demo Prescriptions
    console.log('[Seed] Creating demo prescriptions...');
    const approvedPrescription = await Prescription.create({
      customer: demoCustomer._id,
      fileUrl: '/uploads/prescriptions/sample-rx-demo.png',
      originalFileName: 'Dr_Sharma_Prescription_Oct2026.png',
      fileType: 'image/png',
      fileSize: 245000,
      patientName: 'Amit Patel',
      patientAge: 42,
      doctorName: 'Dr. V. K. Mathur (MD Medicine)',
      doctorRegNumber: 'MCI-2012-99882',
      status: 'approved',
      reviewNotes: 'Verified diagnosis for Upper Respiratory Tract Infection. Augmentin 625 Duo 1 tab BD for 5 days confirmed.',
      reviewedBy: pharmacistUser._id,
      reviewedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      validUntil: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
    });

    const pendingPrescription = await Prescription.create({
      customer: customer2._id,
      fileUrl: '/uploads/prescriptions/sample-rx-demo.png',
      originalFileName: 'Consultation_Slip_Ananya.png',
      fileType: 'image/png',
      fileSize: 310000,
      patientName: 'Ananya Deshmukh',
      patientAge: 34,
      doctorName: 'Dr. Sneha Sen (Cardiologist)',
      doctorRegNumber: 'DMC-2015-4421',
      status: 'pending_review',
      reviewNotes: '',
      reviewedBy: null
    });

    // 7. Create Demo Orders with FEFO Batch Snapshots
    console.log('[Seed] Creating demo orders...');
    // Order 1: Delivered prescription order
    const order1Items = [
      {
        product: products[0]._id, // Augmentin 625
        productName: products[0].name,
        sku: products[0].sku,
        dosageForm: products[0].dosageForm,
        packSize: products[0].packSize,
        quantity: 2,
        unitPrice: products[0].sellingPrice,
        taxRate: 12,
        taxAmount: 49.08,
        totalAmount: 409.00,
        requiresPrescription: true,
        batchAllocations: [
          {
            batch: createdBatches[0]._id, // Allocated from earliest expiring batch AUG-B2401
            batchNumber: 'AUG-B2401',
            expiryDate: createdBatches[0].expiryDate,
            quantity: 2,
            unitPrice: createdBatches[0].purchasePrice
          }
        ]
      },
      {
        product: products[6]._id, // Dolo 650
        productName: products[6].name,
        sku: products[6].sku,
        dosageForm: products[6].dosageForm,
        packSize: products[6].packSize,
        quantity: 2,
        unitPrice: products[6].sellingPrice,
        taxRate: 12,
        taxAmount: 8.06,
        totalAmount: 67.20,
        requiresPrescription: false,
        batchAllocations: [
          {
            batch: createdBatches[5]._id,
            batchNumber: 'DOL-24K09',
            expiryDate: createdBatches[5].expiryDate,
            quantity: 2,
            unitPrice: createdBatches[5].purchasePrice
          }
        ]
      }
    ];

    const subtotal1 = 476.20;
    const taxTotal1 = 57.14;
    const grandTotal1 = 533.34;

    const order1 = await Order.create({
      orderNumber: 'ORD-2026-1001',
      invoiceNumber: 'INV-ORD-2026-1001',
      customer: demoCustomer._id,
      customerSnapshot: {
        name: demoCustomer.name,
        email: demoCustomer.email,
        phone: demoCustomer.phone
      },
      deliveryAddress: demoCustomer.address,
      items: order1Items,
      subtotal: subtotal1,
      taxTotal: taxTotal1,
      cgst: Number((taxTotal1 / 2).toFixed(2)),
      sgst: Number((taxTotal1 / 2).toFixed(2)),
      deliveryCharge: 0,
      grandTotal: grandTotal1,
      prescription: approvedPrescription._id,
      prescriptionStatus: 'approved',
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      orderStatus: 'delivered',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'order_placed', changedBy: demoCustomer._id, changedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), note: 'Order placed with prescription upload' },
        { status: 'prescription_approved', changedBy: pharmacistUser._id, changedAt: new Date(now.getTime() - 3.8 * 24 * 60 * 60 * 1000), note: 'Prescription approved by pharmacist' },
        { status: 'processing', changedBy: adminUser._id, changedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), note: 'Items picked from Batch AUG-B2401' },
        { status: 'packed', changedBy: adminUser._id, changedAt: new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000), note: 'Securely packed in tamper-proof bag' },
        { status: 'out_for_delivery', changedBy: adminUser._id, changedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), note: 'Assigned to MediStore Express Courier' },
        { status: 'delivered', changedBy: adminUser._id, changedAt: new Date(now.getTime() - 1.8 * 24 * 60 * 60 * 1000), note: 'Delivered and signed by recipient' }
      ]
    });

    approvedPrescription.order = order1._id;
    await approvedPrescription.save();

    // Order 2: Order in Pending Prescription Review status
    const order2 = await Order.create({
      orderNumber: 'ORD-2026-1002',
      invoiceNumber: 'INV-ORD-2026-1002',
      customer: customer2._id,
      customerSnapshot: {
        name: customer2.name,
        email: customer2.email,
        phone: customer2.phone
      },
      deliveryAddress: customer2.address,
      items: [
        {
          product: products[3]._id, // Telma 40
          productName: products[3].name,
          sku: products[3].sku,
          dosageForm: products[3].dosageForm,
          packSize: products[3].packSize,
          quantity: 1,
          unitPrice: products[3].sellingPrice,
          taxRate: 12,
          taxAmount: 26.40,
          totalAmount: 220.00,
          requiresPrescription: true,
          batchAllocations: []
        }
      ],
      subtotal: 220.00,
      taxTotal: 26.40,
      cgst: 13.20,
      sgst: 13.20,
      deliveryCharge: 50,
      grandTotal: 296.40,
      prescription: pendingPrescription._id,
      prescriptionStatus: 'pending_review',
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      orderStatus: 'pending_prescription_review',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      statusHistory: [
        {
          status: 'pending_prescription_review',
          changedBy: customer2._id,
          changedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          note: 'Prescription submitted. Pharmacist review required.'
        }
      ]
    });

    pendingPrescription.order = order2._id;
    await pendingPrescription.save();

    // Order 3: Processing OTC Order
    await Order.create({
      orderNumber: 'ORD-2026-1003',
      invoiceNumber: 'INV-ORD-2026-1003',
      customer: demoCustomer._id,
      customerSnapshot: {
        name: demoCustomer.name,
        email: demoCustomer.email,
        phone: demoCustomer.phone
      },
      deliveryAddress: demoCustomer.address,
      items: [
        {
          product: products[16]._id, // Accu-Chek Kit
          productName: products[16].name,
          sku: products[16].sku,
          dosageForm: products[16].dosageForm,
          packSize: products[16].packSize,
          quantity: 1,
          unitPrice: products[16].sellingPrice,
          taxRate: 12,
          taxAmount: 143.88,
          totalAmount: 1199.00,
          requiresPrescription: false,
          batchAllocations: []
        },
        {
          product: products[21]._id, // Limcee
          productName: products[21].name,
          sku: products[21].sku,
          dosageForm: products[21].dosageForm,
          packSize: products[21].packSize,
          quantity: 2,
          unitPrice: products[21].sellingPrice,
          taxRate: 12,
          taxAmount: 6.84,
          totalAmount: 57.00,
          requiresPrescription: false,
          batchAllocations: []
        }
      ],
      subtotal: 1256.00,
      taxTotal: 150.72,
      cgst: 75.36,
      sgst: 75.36,
      deliveryCharge: 0,
      grandTotal: 1406.72,
      prescriptionStatus: 'not_required',
      paymentMethod: 'card',
      paymentStatus: 'completed',
      orderStatus: 'processing',
      createdAt: new Date(now.getTime() - 14 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'order_placed', changedBy: demoCustomer._id, changedAt: new Date(now.getTime() - 14 * 60 * 60 * 1000), note: 'Card payment authorized' },
        { status: 'confirmed', changedBy: adminUser._id, changedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), note: 'Order confirmed and sent to pharmacy dispatch' },
        { status: 'processing', changedBy: adminUser._id, changedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000), note: 'Packing medical devices and supplements' }
      ]
    });

    console.log('[Seed] Database successfully seeded with realistic pharmacy data!');
    console.log('--------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('Admin:       admin@medistore.health       / Password@123');
    console.log('Pharmacist:  pharmacist@medistore.health  / Password@123');
    console.log('Customer:    customer@medistore.health    / Password@123');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seed();
