'use client';

import { useState } from 'react';
import { toggleWishlistProduct, addToCart } from '@/app/actions';

export default function ProductDetailActions({ productId, initialWished, userId, isAdmin }: { productId: string, initialWished: boolean, userId: string, isAdmin?: boolean }) {
  const [wished, setWished] = useState(initialWished);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  if (isAdmin) {
    return null;
  }

  async function handleWishlist() {
    if (!userId) return alert('Please login to use wishlist');
    setLoadingWishlist(true);
    const res = await toggleWishlistProduct(userId, productId);
    if (res.success) {
      setWished(res.isSaved || false);
    }
    setLoadingWishlist(false);
  }

  async function handleAddToCart() {
    if (!userId) return alert('Please login to book/buy');
    setLoadingCart(true);
    const res = await addToCart(productId);
    if (res.success) {
      alert("Added to cart!");
    } else {
      alert(res.message || "Failed to add to cart");
    }
    setLoadingCart(false);
  }

  return (
    <div className="flex gap-4 mt-auto">
        <button 
          disabled={loadingCart}
          onClick={handleAddToCart}
          className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-xl shadow-slate-900/20 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
           {loadingCart ? '...' : '🛒 Add to Cart'}
        </button>
        <button 
          disabled={loadingWishlist}
          onClick={handleWishlist}
          className={`w-16 h-16 border rounded-2xl flex items-center justify-center shadow-sm transition-colors text-2xl ${wished ? 'bg-red-50 text-red-500 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
        >
           {wished ? '❤️' : '🤍'}
        </button>
    </div>
  );
}
