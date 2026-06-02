'use client';

import { useState } from 'react';
import { toggleWishlistProduct, addToCart } from '@/app/actions';

export default function ProductCardActions({ productId, initialWished, userId, isAdmin }: { productId: string, initialWished: boolean, userId: string, isAdmin?: boolean }) {
  const [wished, setWished] = useState(initialWished);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  if (isAdmin) {
    return (
      <div className="mt-4 flex gap-2 w-full z-10 relative">
        <span className="w-full text-center bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-orange-600 transition-colors text-sm block">
          Detail Barang
        </span>
      </div>
    );
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return alert('Please login to use wishlist');
    setLoadingWishlist(true);
    const res = await toggleWishlistProduct(userId, productId);
    if (res.success) {
      setWished(res.isSaved || false);
    }
    setLoadingWishlist(false);
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="mt-4 flex gap-2 w-full z-10 relative">
      <button 
        disabled={loadingCart}
        onClick={handleAddToCart} 
        className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
      >
        {loadingCart ? '...' : 'Add to Cart'}
      </button>
      <button 
        disabled={loadingWishlist}
        onClick={handleWishlist} 
        className={`w-10 flex items-center justify-center rounded-xl border transition-colors ${wished ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200'}`}
      >
        {wished ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
