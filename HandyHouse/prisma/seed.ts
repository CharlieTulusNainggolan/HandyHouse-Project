import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 0. Reset Database (Delete existing records)
  console.log('Resetting existing data...');
  await prisma.wishlistItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Existing data deleted successfully.');

  // 1. Create 6 Users
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashUser = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@tokorumah.com', name: 'Admin HandyHouse', passwordHash: passwordHashAdmin, role: 'ADMIN' },
    { email: 'charlietulus1@gmail.com', name: 'Charlie Tulus', passwordHash: passwordHashUser, role: 'USER' },
    { email: 'budi@example.com', name: 'Budi Santoso', passwordHash: passwordHashUser, role: 'USER' },
    { email: 'siti@example.com', name: 'Siti Aminah', passwordHash: passwordHashUser, role: 'USER' },
    { email: 'joko@example.com', name: 'Joko Anwar', passwordHash: passwordHashUser, role: 'USER' },
    { email: 'dina@example.com', name: 'Dina Mariana', passwordHash: passwordHashUser, role: 'USER' },
  ] as const;

  const createdUsers = [];
  for (const u of users) {
    const created = await prisma.user.create({ data: u });
    createdUsers.push(created);
  }
  console.log('✅ 6 Users created.');

  // 2. Create 6 Suppliers
  const suppliers = [
    { name: 'PT Perkakas Mandiri', contactInfo: '081234567890 (Bapak Budi)', rating: 4.8 },
    { name: 'CV Makmur Jaya Tools', contactInfo: '085678901234 (Ibu Ani)', rating: 4.5 },
    { name: 'Global Hardware Supply', contactInfo: 'contact@globalhardware.id', rating: 4.9 },
    { name: 'Sentosa Jaya Bangunan', contactInfo: '081122334455 (Pak Anton)', rating: 4.2 },
    { name: 'Indo Teknik Perkasa', contactInfo: '087766554433 (Bu Rini)', rating: 4.7 },
    { name: 'Toko Material Bersama', contactInfo: '089988776655 (Pak Doni)', rating: 4.6 },
  ];

  const createdSuppliers = [];
  for (const s of suppliers) {
    const created = await prisma.supplier.create({ data: s });
    createdSuppliers.push(created);
  }
  console.log('✅ 6 Suppliers created.');

  // 3. Create 10 Products
  const products = [
    {
      name: 'Mesin Bor Bosch GSB 550',
      description: 'Mesin bor listrik berkualitas tinggi yang tahan lama untuk berbagai keperluan pertukangan maupun industri.',
      price: 850000,
      category: 'POWER_TOOLS',
      stockLevel: 50,
      safetyStock: 10,
      costPrice: 650000,
      supplierId: createdSuppliers[0].id,
      brand: 'Bosch',
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Palu Tekiro 16 oz',
      description: 'Palu tukang dengan pegangan berlapis karet agar tidak licin. Kuat dan awet.',
      price: 65000,
      category: 'HAND_TOOLS',
      stockLevel: 100,
      safetyStock: 20,
      costPrice: 45000,
      supplierId: createdSuppliers[1].id,
      brand: 'Tekiro',
      imageUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Obeng Set Krisbow 32 pcs',
      description: 'Set obeng presisi multifungsi untuk perbaikan elektronik dan perkakas rumah.',
      price: 120000,
      category: 'HAND_TOOLS',
      stockLevel: 45,
      safetyStock: 15,
      costPrice: 90000,
      supplierId: createdSuppliers[2].id,
      brand: 'Krisbow',
      imageUrl: 'https://images.unsplash.com/photo-1566937169390-7be4f63bb7bb?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Gergaji Kayu Stanley 20"',
      description: 'Gergaji potong kayu dengan mata tajam, cocok untuk pekerjaan presisi.',
      price: 150000,
      category: 'HAND_TOOLS',
      stockLevel: 30,
      safetyStock: 5,
      costPrice: 110000,
      supplierId: createdSuppliers[3].id,
      brand: 'Stanley',
      imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Tang Kombinasi Knipex 8"',
      description: 'Tang multifungsi berkualitas Jerman untuk menjepit dan memotong kabel.',
      price: 250000,
      category: 'HAND_TOOLS',
      stockLevel: 25,
      safetyStock: 10,
      costPrice: 200000,
      supplierId: createdSuppliers[4].id,
      brand: 'Knipex',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1678116035987-99435d8af1da?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Meteran Roll Kenmaster 5m',
      description: 'Alat ukur roll panjang 5 meter yang ringkas dan dilengkapi sistem pengunci.',
      price: 35000,
      category: 'HAND_TOOLS',
      stockLevel: 150,
      safetyStock: 30,
      costPrice: 20000,
      supplierId: createdSuppliers[5].id,
      brand: 'Kenmaster',
      imageUrl: 'https://images.unsplash.com/photo-1585807469399-6e3e56c54784?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Mesin Gerinda Makita 4"',
      description: 'Gerinda tangan ringan namun bertenaga untuk memotong atau memoles besi.',
      price: 750000,
      category: 'POWER_TOOLS',
      stockLevel: 40,
      safetyStock: 10,
      costPrice: 600000,
      supplierId: createdSuppliers[0].id,
      brand: 'Makita',
      imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Kunci Pas Ring Set 11 Pcs',
      description: 'Satu set kunci pas ring dari bahan chrome vanadium untuk perbaikan kendaraan ringan.',
      price: 180000,
      category: 'HAND_TOOLS',
      stockLevel: 60,
      safetyStock: 15,
      costPrice: 130000,
      supplierId: createdSuppliers[1].id,
      brand: 'Kenmaster',
      imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Selang Air Serat 15m',
      description: 'Selang taman anti kusut sepanjang 15 meter, sangat cocok untuk menyiram tanaman.',
      price: 95000,
      category: 'GARDENING',
      stockLevel: 80,
      safetyStock: 20,
      costPrice: 70000,
      supplierId: createdSuppliers[2].id,
      brand: 'Hozelock',
      imageUrl: 'https://images.unsplash.com/photo-1416879598555-220b3cb1c95b?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Cangkul Baja Asli',
      description: 'Cangkul baja kuat tanpa gagang, tahan karat dan cocok untuk area kebun tanah keras.',
      price: 55000,
      category: 'GARDENING',
      stockLevel: 90,
      safetyStock: 25,
      costPrice: 40000,
      supplierId: createdSuppliers[3].id,
      brand: 'Lokal',
      imageUrl: 'https://images.unsplash.com/photo-1629831737728-ee1bc0ebbc10?q=80&w=800&auto=format&fit=crop',
    }
  ] as const;

  const createdProducts = [];
  for (const p of products) {
    const created = await prisma.product.create({ data: p });
    createdProducts.push(created);
  }
  console.log('✅ 10 Products created.');

  // 4. Create 6 Purchase Orders
  const purchaseOrders = [];
  for (let i = 0; i < 6; i++) {
    const po = await prisma.purchaseOrder.create({
      data: {
        supplierId: createdProducts[i].supplierId as string,
        productId: createdProducts[i].id,
        quantity: 50,
        status: i % 2 === 0 ? 'RECEIVED' : 'APPROVED',
      }
    });
    purchaseOrders.push(po);
  }
  console.log('✅ 6 PurchaseOrders created.');

  // 5. Create 6 Orders (User orders)
  const orders = [];
  for (let i = 0; i < 6; i++) {
    const order = await prisma.order.create({
      data: {
        userId: createdUsers[1].id, // charlietulus
        productId: createdProducts[i].id,
        quantity: i + 1,
        status: i % 2 === 0 ? 'DELIVERED' : 'PROCESSING',
      }
    });
    orders.push(order);
  }
  console.log('✅ 6 Orders created.');

  // 6. Create 6 Inventory Logs
  const inventoryLogs = [];
  for (let i = 0; i < 6; i++) {
    const log = await prisma.inventoryLog.create({
      data: {
        productId: createdProducts[i].id,
        type: i % 2 === 0 ? 'IN' : 'OUT',
        quantity: 10 + i,
        notes: i % 2 === 0 ? 'Penerimaan stok dari supplier' : 'Penjualan produk',
      }
    });
    inventoryLogs.push(log);
  }
  console.log('✅ 6 InventoryLogs created.');

  // 7. Create 6 Wishlist Items
  const wishlistItems = [];
  for (let i = 0; i < 6; i++) {
    const w = await prisma.wishlistItem.create({
      data: {
        userId: createdUsers[1].id,
        productId: createdProducts[i + 4].id,
      }
    });
    wishlistItems.push(w);
  }
  console.log('✅ 6 WishlistItems created.');

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
