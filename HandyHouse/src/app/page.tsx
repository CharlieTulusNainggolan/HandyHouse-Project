import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import InteractiveButton from '@/components/InteractiveButton';
import { headers } from 'next/headers';
import CRMDashboard from './crm/page';
import HRDashboard from './hr/page';

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Jika diakses dari port 3001, langsung tampilkan CRM
  if (host.includes('3001')) {
    return <CRMDashboard />;
  }
  
  // Jika diakses dari port 3002, langsung tampilkan HR
  if (host.includes('3002')) {
    return <HRDashboard />;
  }
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 relative z-10">
          <div className="inline-block bg-orange-100 border border-orange-200 px-4 py-1.5 rounded-full">
            <span className="text-xs font-black text-orange-700 tracking-wide uppercase">PROFESSIONAL GRADE 🛠️</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 tracking-tight">
            Your Trusted Partner in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-amber-500">
              Hardware & Services.
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-lg font-medium leading-relaxed">
            We provide top-tier hardware supplies, professional field equipment, and dedicated maintenance services for both households and industrial projects.
          </p>
          <div className="flex gap-4">
             <Link href="#services" className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-colors">
               Explore Services
             </Link>
             <Link href="/products" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold shadow-sm hover:border-orange-300 hover:text-orange-600 transition-all">
               View Catalog
             </Link>
          </div>
        </div>
        
        <div className="flex-1 relative w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-amber-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
          <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative bg-white flex items-center justify-center p-2">
            <img 
              src="https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Premium toolset" 
              className="object-cover w-full h-full rounded-[2rem] hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
           <div className="flex-1">
              <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-slate-50 relative bg-white p-2">
                <img 
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1000&q=80" 
                  alt="HandyHouse Professional Team" 
                  className="object-cover w-full h-full rounded-[2rem] hover:scale-105 transition-transform duration-700"
                />
              </div>
           </div>
           <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Who We Are</h2>
              <h3 className="text-2xl font-bold text-orange-600">Building Foundations, Empowering Work.</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                At HandyHouse, we don't just sell tools; we empower your projects. Since our inception, we have dedicated ourselves to bridging the gap between premium industrial equipment and the people who need them most. 
              </p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Whether you are a seasoned contractor managing a massive construction site, or a homeowner tackling a weekend renovation, our commitment to quality, durability, and reliability remains the same.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                 <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="text-3xl font-black text-slate-900">10k+</h4>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Products Sold</p>
                 </div>
                 <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="text-3xl font-black text-slate-900">99%</h4>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Client Satisfaction</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Our Core Services</h2>
            <p className="text-slate-500 text-lg font-medium">Beyond retail, HandyHouse provides comprehensive service solutions tailored to ensure your operations never stop.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 hover:border-orange-300 transition-all group">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-slate-100">
                   <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Equipment Supply" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Equipment Supply</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Bulk ordering and specialized sourcing for large-scale industrial projects. We guarantee stock availability and rapid delivery.
                </p>
             </div>

             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 hover:border-orange-300 transition-all group">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-slate-100">
                   <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Expert Consultation" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Expert Consultation</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Not sure what you need? Our engineers and hardware experts offer on-site and remote consultation for your specific project requirements.
                </p>
             </div>

             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 hover:border-orange-300 transition-all group">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-slate-100">
                   <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Maintenance & Support" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Maintenance & Repair</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Protect your investment. Our certified technicians provide routine maintenance, deep repairs, and swift warranty processing for all tools.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase (Pengenalan Produk) */}
      <section className="pt-20 pb-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Explore Our Catalog</h2>
            <p className="text-slate-500 text-lg font-medium">Browse through our meticulously organized product categories designed to meet every hardware need.</p>
          </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Power Tools', 'Kitchenware', 'Gardening', 'Hardware'].map(category => (
                <Link href={`/products?category=${category.toUpperCase().replace(' ', '_')}`} key={category}>
                  <div className="block w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center hover:shadow-xl hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-all hover:-translate-y-2 group">
                     <div className="w-16 h-16 bg-white shadow-sm text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        {category === 'Power Tools' ? '⚡' : category === 'Kitchenware' ? '🍳' : category === 'Gardening' ? '🌻' : '🔧'}
                     </div>
                     <h4 className="font-extrabold text-slate-800 text-lg">{category}</h4>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                <span className="text-white font-black text-lg">H</span>
              </div>
               <span className="text-2xl font-black text-white">HandyHouse</span>
            </div>
            <p className="text-slate-400 max-w-sm mt-4 font-medium leading-relaxed">Equipping your household and fieldwork since 2026. Top-tier supplies wrapped in an industrial e-commerce experience.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Categories</Link></li>
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Hardware Deals</Link></li>
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Gift Cards</Link></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Track Order</Link></li>
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Returns System</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-900 text-sm font-medium text-center flex flex-col md:flex-row justify-between items-center">
           <p>© 2026 HandyHouse Equipment E-Commerce. All rights reserved.</p>
           <div className="flex space-x-4 mt-4 md:mt-0">
              <InteractiveButton alertMsg="Membuka tab X (Twitter)" className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center hover:bg-orange-600 cursor-pointer text-white transition-colors">X</InteractiveButton>
              <InteractiveButton alertMsg="Membuka tab LinkedIn" className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center hover:bg-orange-600 cursor-pointer text-white transition-colors">in</InteractiveButton>
           </div>
        </div>
      </footer>
    </main>
  );
}
