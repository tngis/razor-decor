/**
 * Firebase Database Setup Script
 * Run: node scripts/setup-database.js
 *
 * This script will:
 * - Create initial collections
 * - Add sample products
 * - Set up admin user (optional)
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();

// Sample products data
const sampleProducts = [
  {
    name: {
      en: "Metal Wall Art - Dragon",
      mn: "Төмөр хананы урлаг - Луу"
    },
    description: {
      en: "Stunning laser-cut dragon design perfect for modern homes. Made from high-quality steel with powder coating finish.",
      mn: "Орчин үеийн гэрт тохирох гайхалтай лазер зүссэн луу загвар. Өндөр чанарын ган материалаар хийгдсэн, нунтаг будгаар өнгөлсөн."
    },
    price: 150000,
    category: "Wall Art",
    images: [],
    inStock: true,
    featured: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Geometric Wall Panel",
      mn: "Геометр хэлбэрийн хана самбар"
    },
    description: {
      en: "Modern geometric pattern panel for interior decoration. Creates stunning shadow effects with proper lighting.",
      mn: "Дотор засал чимэглэлд зориулсан орчин үеийн геометр хэв маяг. Зөв гэрэлтүүлэгтэй нөхцөлд гайхалтай сүүдрийн эффект үүсгэдэг."
    },
    price: 85000,
    category: "Wall Art",
    images: [],
    inStock: true,
    featured: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Custom Name Sign",
      mn: "Захиалгат нэрийн тэмдэг"
    },
    description: {
      en: "Personalized metal name sign for home or business. Available in various fonts and sizes.",
      mn: "Гэр эсвэл бизнест зориулсан захиалгат төмөр нэрийн тэмдэг. Янз бүрийн фонт, хэмжээтэй."
    },
    price: 45000,
    category: "Custom Signs",
    images: [],
    inStock: true,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Mongolian Traditional Pattern",
      mn: "Монгол уламжлалт хээ"
    },
    description: {
      en: "Beautiful traditional Mongolian pattern laser-cut metal art. Celebrates Mongolian heritage with modern craftsmanship.",
      mn: "Монголын өв уламжлалыг орчин үеийн урлагаар хослуулсан гайхалтай лазер зүссэн төмөр урлаг."
    },
    price: 120000,
    category: "Wall Art",
    images: [],
    inStock: true,
    featured: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Tree of Life",
      mn: "Амьдралын мод"
    },
    description: {
      en: "Intricate tree of life design symbolizing growth and connection. Perfect for living rooms and meditation spaces.",
      mn: "Өсөлт, холбоо хамааралыг бэлэгддэг нарийн ширхэгтэй амьдралын модны загвар. Зочны өрөө, бясалгалын орон зайд тохиромжтой."
    },
    price: 95000,
    category: "Wall Art",
    images: [],
    inStock: true,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Business Logo Sign",
      mn: "Бизнесийн лого тэмдэг"
    },
    description: {
      en: "Professional metal logo sign for businesses. Send us your logo and we'll create a stunning metal version.",
      mn: "Бизнест зориулсан мэргэжлийн төмөр лого тэмдэг. Логоны зургаа илгээгээрэй, бид танд гайхалтай төмөр хувилбарыг үйлдвэрлэнэ."
    },
    price: 75000,
    category: "Custom Signs",
    images: [],
    inStock: true,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Mountain Range Silhouette",
      mn: "Уулын хөндий силуэт"
    },
    description: {
      en: "Minimalist mountain range design perfect for nature lovers. Available in various sizes.",
      mn: "Байгалийг хайрладаг хүмүүст зориулсан минималист уулын хөндийн загвар. Янз бүрийн хэмжээтэй."
    },
    price: 65000,
    category: "Wall Art",
    images: [],
    inStock: true,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Islamic Calligraphy",
      mn: "Исламын уран бичлэг"
    },
    description: {
      en: "Beautiful Islamic calligraphy art piece. Available in various verses and sizes.",
      mn: "Гайхалтай Исламын уран бичлэгийн урлаг. Янз бүрийн бичвэр, хэмжээтэй."
    },
    price: 110000,
    category: "Wall Art",
    images: [],
    inStock: true,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Compass Rose",
      mn: "Луужингийн сарнай"
    },
    description: {
      en: "Elegant compass rose design for travelers and adventurers. Symbolizes direction and exploration.",
      mn: "Аялагчид, адал явдал хайгчдад зориулсан дэгжин луужингийн сарнай загвар. Чиг баримжаа, судалгааны бэлгэ тэмдэг."
    },
    price: 80000,
    category: "Wall Art",
    images: [],
    inStock: true,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: {
      en: "Custom CNC Cutting Service",
      mn: "Захиалгат CNC лазер зүсэлтийн үйлчилгээ"
    },
    description: {
      en: "Professional CNC laser cutting service. Send us your design and we'll bring it to life. Pricing varies by size and complexity.",
      mn: "Мэргэжлийн CNC лазер зүсэлтийн үйлчилгээ. Загвараа илгээгээрэй, бид үүнийг бодит болгоно. Үнэ нь хэмжээ, нарийн төвөгтэй байдлаас хамаарна."
    },
    price: 50000,
    category: "Services",
    images: [],
    inStock: true,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Categories
const categories = [
  {
    id: 'wall-art',
    name: { en: 'Wall Art', mn: 'Хананы урлаг' },
    slug: 'wall-art',
    description: {
      en: 'Decorative metal wall art pieces',
      mn: 'Хананы төмөр урлагийн чимэглэл'
    }
  },
  {
    id: 'custom-signs',
    name: { en: 'Custom Signs', mn: 'Захиалгат тэмдэг' },
    slug: 'custom-signs',
    description: {
      en: 'Personalized metal signs',
      mn: 'Захиалгат төмөр тэмдэг'
    }
  },
  {
    id: 'services',
    name: { en: 'Services', mn: 'Үйлчилгээ' },
    slug: 'services',
    description: {
      en: 'CNC laser cutting services',
      mn: 'CNC лазер зүсэлтийн үйлчилгээ'
    }
  }
];

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Create products collection
    console.log('📦 Creating products...');
    let productCount = 0;
    for (const product of sampleProducts) {
      await db.collection('products').add(product);
      productCount++;
      console.log(`   ✓ Added product: ${product.name.en}`);
    }
    console.log(`✅ Created ${productCount} products\n`);

    // Create categories (optional)
    console.log('📂 Creating categories...');
    for (const category of categories) {
      await db.collection('categories').doc(category.id).set(category);
      console.log(`   ✓ Added category: ${category.name.en}`);
    }
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create empty collections (for structure)
    console.log('📁 Creating collection structure...');

    // We'll create a placeholder document and delete it to initialize collections
    const tempOrderRef = await db.collection('orders').add({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await tempOrderRef.delete();
    console.log('   ✓ Orders collection initialized');

    const tempUserRef = await db.collection('users').add({
      _placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await tempUserRef.delete();
    console.log('   ✓ Users collection initialized');

    console.log('\n✨ Database setup complete!\n');
    console.log('📊 Summary:');
    console.log(`   - ${productCount} products created`);
    console.log(`   - ${categories.length} categories created`);
    console.log('   - Collections initialized: users, orders, products, categories\n');

    console.log('🎯 Next steps:');
    console.log('   1. Register a user via the app');
    console.log('   2. Set user role to "admin" in Firestore');
    console.log('   3. Upload product images to Firebase Storage');
    console.log('   4. Update product documents with image URLs\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Prompt to create admin user
async function createAdminUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\n👤 Would you like to create an admin user? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        rl.question('Enter phone number (e.g., +97688887777): ', async (phone) => {
          rl.question('Enter PIN (4 digits): ', async (pin) => {
            rl.question('Enter display name: ', async (name) => {
              try {
                // Create user in Authentication
                const userRecord = await admin.auth().createUser({
                  phoneNumber: phone,
                  displayName: name
                });

                // Create user document in Firestore
                await db.collection('users').doc(userRecord.uid).set({
                  phoneNumber: phone,
                  displayName: name,
                  pin: pin, // ⚠️ Should be hashed in production!
                  role: 'admin',
                  createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log('\n✅ Admin user created successfully!');
                console.log(`   UID: ${userRecord.uid}`);
                console.log(`   Phone: ${phone}`);
                console.log(`   Role: admin\n`);
              } catch (error) {
                console.error('❌ Error creating admin user:', error.message);
              }
              rl.close();
              resolve();
            });
          });
        });
      } else {
        rl.close();
        resolve();
      }
    });
  });
}

// Run the setup
(async () => {
  await setupDatabase();
  await createAdminUser();
  console.log('🎉 All done! Your database is ready.\n');
  process.exit(0);
})();
