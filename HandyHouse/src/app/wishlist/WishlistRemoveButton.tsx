'use client';

import { useState } from 'react';
import { toggleWishlistProduct } from '@/app/actions';

export default function WishlistRemoveButton({ userId, productId }: { userId: string, productId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleRemove() {
        setLoading(true);
        await toggleWishlistProduct(userId, productId);
        setLoading(false);
    }

    return (
        <button 
            disabled={loading}
            onClick={handleRemove}
            className="flex-1 md:flex-none border border-slate-300 text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
            {loading ? 'Removing...' : 'Remove'}
        </button>
    );
}
