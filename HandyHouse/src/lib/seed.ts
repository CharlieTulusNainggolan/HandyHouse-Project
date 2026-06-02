import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Comprehensive Data...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@handyhouse.com' },
    update: {},
    create: {
      email: 'admin@handyhouse.com',
      name: 'Super Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@handyhouse.com' },
    update: {},
    create: {
      email: 'staff@handyhouse.com',
      name: 'Warehouse Staff',
      passwordHash,
      role: 'USER', // We use USER role as STAFF to maintain compatibility
    },
  });

  console.log('✅ Users seeded');

  // 2. Create Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'PT Perkakas Mandiri',
      contactInfo: '081234567890',
      address: 'Jl. Industri No. 1, Jakarta Industrial Estate',
      rating: 4.8,
    }
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Global Hardware Corp',
      contactInfo: '089876543210',
      address: 'Jl. Surya Teknologi No. 45, Surabaya',
      rating: 4.5,
    }
  });

  console.log('✅ Suppliers seeded');

  // 3. Create Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Mesin Bor Bosch GSB 550',
      description: 'Mesin bor listrik berkualitas tinggi yang tahan lama.',
      price: 850000,
      sku: 'BOSCH-GSB-550',
      category: 'POWER_TOOLS',
      stockLevel: 50,
      safetyStock: 10,
      costPrice: 650000,
      supplierId: supplier1.id,
      brand: 'Bosch',
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop',
    }
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Set Palu dan Obeng',
      description: 'Set perkakas dasar untuk rumah tangga.',
      price: 150000,
      sku: 'HH-SET-001',
      category: 'HAND_TOOLS',
      stockLevel: 100,
      safetyStock: 20,
      costPrice: 100000,
      supplierId: supplier2.id,
      brand: 'HandyHouse',
    }
  });

  console.log('✅ Products seeded');

  // 4. Create InventoryLogs (equivalent to requested StockMovement)
  await prisma.inventoryLog.create({
    data: {
      productId: product1.id,
      type: 'IN',
      quantity: 50,
      notes: 'Initial stock seeding dari pabrik (Stock Movement)',
    }
  });

  await prisma.inventoryLog.create({
    data: {
      productId: product2.id,
      type: 'IN',
      quantity: 100,
      notes: 'Initial stock seeding dari gudang (Stock Movement)',
    }
  });

  console.log('✅ InventoryLogs (StockMovements) seeded');

  console.log('\n🎉 Full Database Sync completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
