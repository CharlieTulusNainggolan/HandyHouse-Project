'use server'

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Category } from '@prisma/client';

async function extractDirectImageUrl(url: string): Promise<string> {
  if (!url || !url.startsWith('http')) return url;
  // If it already looks like an image file, just return it
  if (url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?.*)?$/i)) return url;
  
  try {
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 3600 }
    });
    const html = await response.text();
    const ogImageMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) 
      || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
    
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
  } catch (err) {
    console.error('Error fetching external image HTML:', err);
  }
  return url;
}

export async function toggleWishlistProduct(userId: string, productId: string) {
  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      revalidatePath('/wishlist');
      revalidatePath('/products');
      return { success: true, message: 'Item removed from wishlist', isSaved: false };
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });
      revalidatePath('/wishlist');
      revalidatePath('/products');
      return { success: true, message: 'Item added to wishlist', isSaved: true };
    }
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    return { success: false, message: 'An error occurred while updating your wishlist.' };
  }
}

export async function searchProducts(query: string, category?: string) {
  try {
    const filters: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive'} }
      ],
    };

    if (category) {
      filters.category = category.toUpperCase();
    }

    const products = await prisma.product.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error('Error searching products:', error);
    return { success: false, data: [] };
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as Category;
    const stockLevel = parseInt(formData.get('stockLevel') as string, 10);
    const brand = formData.get('brand') as string;
    const sku = formData.get('sku') as string | null;
    let imageUrl = formData.get('imageUrl') as string;
    
    if (imageUrl) {
      imageUrl = await extractDirectImageUrl(imageUrl);
    }

    const newProduct = await prisma.product.create({
       data: {
         name,
         description,
         price,
         category,
         stockLevel,
         brand,
         sku: sku || null,
         imageUrl,
       }
    });

    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, product: newProduct };
  } catch (err) {
     console.error('Error creating product:', err);
     return { success: false, message: 'Failed to create product listing' };
  }
}

import bcrypt from 'bcryptjs';

export async function setAuthCookie(payload: { id: string, email: string, role: string, name: string }) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  return { success: true };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  redirect('/login');
}

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
      return { success: false, message: 'Missing fields' };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: 'Email already registered' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = email === 'admin@tokorumah.com' ? 'ADMIN' : 'USER';

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      }
    });

    return { success: true };
  } catch (err) {
    console.error('Register error:', err);
    return { success: false, message: 'Failed to register' };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, message: 'Missing fields' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { success: false, message: 'Invalid credentials' };
    }

    await setAuthCookie({ id: user.id, email: user.email, role: user.role, name: user.name || '' });
    return { success: true, role: user.role };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: 'Failed to login' };
  }
}

export async function editProduct(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as any;
    const stockLevel = parseInt(formData.get('stockLevel') as string, 10);
    const brand = formData.get('brand') as string;
    const sku = formData.get('sku') as string | null;
    let imageUrl = formData.get('imageUrl') as string;
    
    if (imageUrl) {
      imageUrl = await extractDirectImageUrl(imageUrl);
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        stockLevel,
        brand,
        sku: sku || null,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });

    revalidatePath('/scm');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Edit product error:', err);
    return { success: false, message: 'Failed to edit product' };
  }
}

export async function updateProductPrice(id: string, newPrice: number) {
  try {
    await prisma.product.update({
      where: { id },
      data: { price: newPrice },
    });
    revalidatePath('/scm');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Update price error:', err);
    return { success: false, message: 'Failed to update price' };
  }
}

export async function updateProductStatus(id: string, stockLevel: number) {
  try {
    await prisma.product.update({
      where: { id },
      data: { stockLevel },
    });
    revalidatePath('/scm');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Update status error:', err);
    return { success: false, message: 'Failed to update status' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath('/scm');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Delete product error:', err);
    return { success: false, message: 'Failed to delete product' };
  }
}

export async function addToCart(productId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return { success: false, message: 'Not logged in' };
    const user = JSON.parse(token);

    // Check if already in cart
    const existing = await prisma.order.findFirst({
      where: { userId: user.id, productId, status: 'PENDING' }
    });

    if (existing) {
      await prisma.order.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + 1 }
      });
    } else {
      await prisma.order.create({
        data: {
          userId: user.id,
          productId,
          status: 'PENDING',
          quantity: 1
        }
      });
    }

    revalidatePath('/cart');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Add to cart error:', err);
    return { success: false, message: 'Failed to add to cart' };
  }
}

export async function removeFromCart(orderId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return { success: false };
    const user = JSON.parse(token);

    await prisma.order.delete({
      where: { id: orderId, userId: user.id, status: 'PENDING' }
    });
    revalidatePath('/cart');
    return { success: true };
  } catch (err) {
    console.error('Remove from cart error:', err);
    return { success: false };
  }
}

export async function checkoutCart() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return { success: false, message: 'Not logged in' };
    const user = JSON.parse(token);

    const pendingOrders = await prisma.order.findMany({
       where: { userId: user.id, status: 'PENDING' },
       include: { product: true }
    });

    if (pendingOrders.length === 0) return { success: false, message: 'Cart is empty' };

    // 1. Check stock for all items just to be safe at checkout
    for (const order of pendingOrders) {
       if (order.product.stockLevel < order.quantity) {
          return { success: false, message: `Stok tidak cukup untuk: ${order.product.name}` };
       }
    }

    // 2. We DO NOT deduct stock here anymore. We just update the status to PROCESSING.

    // Update all pending orders to PROCESSING
    await prisma.order.updateMany({
      where: { userId: user.id, status: 'PENDING' },
      data: { status: 'PROCESSING' }
    });
    
    revalidatePath('/cart');
    return { success: true };
  } catch (err) {
    console.error('Checkout error:', err);
    return { success: false, message: 'Failed to checkout' };
  }
}

export async function processOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!order) return { success: false, message: 'Pesanan tidak ditemukan' };

    if (order.product.stockLevel < order.quantity) {
       return { success: false, message: `Stok tidak cukup untuk memproses ${order.product.name}. Sisa stok: ${order.product.stockLevel}` };
    }

    const newStock = order.product.stockLevel - order.quantity;
    
    // Deduct stock
    await prisma.product.update({
      where: { id: order.productId },
      data: { stockLevel: newStock }
    });

    // PO draft logic
    let poDrafted = false;
    if (newStock < order.product.safetyStock) {
       const existingPO = await prisma.purchaseOrder.findFirst({
          where: { productId: order.productId, status: { in: ['DRAFT', 'APPROVED'] } }
       });
       
       if (!existingPO) {
          let supplierId = order.product.supplierId;
          if (!supplierId) {
            const firstSupplier = await prisma.supplier.findFirst();
            if (firstSupplier) {
              supplierId = firstSupplier.id;
            } else {
               const newSupplier = await prisma.supplier.create({
                  data: { name: 'Hardware & Co.', rating: 4.8, contactInfo: 'contact@hardware.co' }
               });
               supplierId = newSupplier.id;
            }
            await prisma.product.update({
              where: { id: order.productId },
              data: { supplierId }
            });
          }
          await prisma.purchaseOrder.create({
            data: {
              supplierId: supplierId,
              productId: order.productId,
              quantity: 50,
              status: 'DRAFT'
            }
          });
          poDrafted = true;
       }
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SHIPPED' }
    });

    revalidatePath('/scm');
    revalidatePath('/products');
    return { success: true, newStock, poDrafted, productId: order.productId };
  } catch (err) {
    console.error('Process order error:', err);
    return { success: false, message: 'Gagal memproses pesanan' };
  }
}

export async function processTransaction(orderIds: string[]) {
  try {
     let successCount = 0;
     let poDrafted = false;
     for (const id of orderIds) {
        const res = await processOrder(id);
        if (res.success) {
           successCount++;
           if (res.poDrafted) poDrafted = true;
        }
     }
     
     if (successCount === 0) return { success: false, message: 'Gagal memproses transaksi (stok mungkin tidak cukup).' };
     return { success: true, poDrafted };
  } catch (err) {
     console.error('Process transaction error', err);
     return { success: false };
  }
}

export async function deleteTransaction(orderIds: string[]) {
  try {
     await prisma.order.deleteMany({
       where: { id: { in: orderIds } }
     });
     revalidatePath('/scm');
     revalidatePath('/history');
     return { success: true };
  } catch (err) {
     console.error('Delete transaction error', err);
     return { success: false };
  }
}

export async function simulateSale(productId: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, message: 'Product not found' };

    const newStock = Math.max(0, product.stockLevel - 1);
    
    // Check if we need to draft a PO
    let poDrafted = false;
    if (newStock < product.safetyStock) {
      // Check if there's already an active PO (DRAFT or APPROVED)
      const existingPO = await prisma.purchaseOrder.findFirst({
        where: { 
          productId: product.id, 
          status: { in: ['DRAFT', 'APPROVED'] }
        }
      });

      if (!existingPO) {
        // Need a supplier
        let supplierId = product.supplierId;
        if (!supplierId) {
          const firstSupplier = await prisma.supplier.findFirst();
          if (firstSupplier) {
            supplierId = firstSupplier.id;
          } else {
             const newSupplier = await prisma.supplier.create({
                data: { name: 'Hardware & Co.', rating: 4.8, contactInfo: 'contact@hardware.co' }
             });
             supplierId = newSupplier.id;
          }
          // Link product to supplier
          await prisma.product.update({
            where: { id: product.id },
            data: { supplierId }
          });
        }
        
        // Draft a PO for 50 units
        await prisma.purchaseOrder.create({
          data: {
            supplierId: supplierId,
            productId: product.id,
            quantity: 50,
            status: 'DRAFT'
          }
        });
        poDrafted = true;
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stockLevel: newStock }
    });

    revalidatePath('/scm');
    revalidatePath('/products');
    return { success: true, newStock, poDrafted };
  } catch (err) {
    console.error('Simulate sale error:', err);
    return { success: false, message: 'Failed to simulate sale' };
  }
}

export async function approvePO(poId: string) {
  try {
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'APPROVED' }
    });
    revalidatePath('/scm');
    return { success: true };
  } catch (err) {
    console.error('Approve PO error:', err);
    return { success: false };
  }
}

export async function receivePO(poId: string) {
  try {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
    if (!po) return { success: false };

    // Update PO to received
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'RECEIVED' }
    });

    // Increment product stock
    await prisma.product.update({
      where: { id: po.productId },
      data: { stockLevel: { increment: po.quantity } }
    });

    revalidatePath('/scm');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Receive PO error:', err);
    return { success: false };
  }
}

