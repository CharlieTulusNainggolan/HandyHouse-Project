import Navbar from "@/components/Navbar";
import prisma from "@/lib/prisma";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { cookies } from "next/headers";
import { Category } from "@prisma/client";
import ProductCardActions from "./ProductCardActions";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    let user: { id: string; role: string } | null = null;
    if (token) {
        try { user = JSON.parse(token); } catch { }
    }

    const resolvedSearchParams = await searchParams;
    const category = resolvedSearchParams.category as Category | undefined;

    const whereClause = category ? { category } : {};

    const products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });

    const userWishlist = new Set<string>();
    if (user) {
        const wishes = await prisma.wishlistItem.findMany({
            where: { userId: user.id },
            select: { productId: true }
        });
        wishes.forEach(w => userWishlist.add(w.productId));
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />

            <div className="bg-slate-900 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl font-black text-white mb-4">Property Catalog</h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">Browse our complete selection of dream properties and book yours today.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <BackButton />
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="text-6xl mb-4">🕸️</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Catalog is Empty</h2>
                        <p className="text-slate-500 mb-6 font-medium">Head over to the admin dashboard to create the first listing.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((item) => (
                            <Link href={`/products/${item.id}`} key={item.id} className="group relative">
                                <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer">
                                    <div className="relative aspect-square overflow-hidden bg-white p-6 border-b border-slate-100 flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 drop-shadow-md" />
                                        ) : (
                                            <div className="text-6xl">🏠</div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-orange-100 text-orange-700 text-xs font-black px-3 py-1.5 rounded-lg tracking-wide">
                                            {item.category.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">{item.name}</h3>
                                        <p className="text-sm font-medium text-slate-500 mb-4">{item.description}</p>
                                        <div className="mt-auto">
                                            <span className="text-xl font-black text-slate-900">
                                                Rp {item.price.toLocaleString('id-ID')}
                                            </span>
                                            <ProductCardActions
                                                productId={item.id}
                                                userId={user?.id || ''}
                                                initialWished={userWishlist.has(item.id)}
                                                isAdmin={user?.role === 'ADMIN'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
