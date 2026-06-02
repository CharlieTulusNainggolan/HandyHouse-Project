'use client';

import { useState } from 'react';
import { createProduct, updateProductPrice, updateProductStatus, deleteProduct, editProduct, simulateSale, approvePO, receivePO, processTransaction, deleteTransaction } from '@/app/actions';

export default function SCMClient({ initialProducts, initialPOs, initialSuppliers, initialOrders }: { initialProducts: any[], initialPOs: any[], initialSuppliers: any[], initialOrders?: any[] }) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'procurement' | 'logistics' | 'analytics' | 'orders'>('inventory');
  
  const [products, setProducts] = useState(initialProducts);
  const [pos, setPos] = useState(initialPOs || []);
  const [suppliers, setSuppliers] = useState(initialSuppliers || []);
  const [orders, setOrders] = useState(initialOrders || []);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add Item form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('HARDWARE');
  const [stockLevel, setStockLevel] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Edit Item form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Edit Price states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');

  // Tab navigation
  const tabs = [
    { id: 'inventory', label: '📦 Inventory Control' },
    { id: 'procurement', label: '🤝 Procurement' },
    { id: 'logistics', label: '🚚 Logistics' },
    { id: 'orders', label: '🛍️ Customer Orders' },
    { id: 'analytics', label: '📈 Analytics' }
  ];

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('stockLevel', stockLevel);
    formData.append('brand', brand);
    formData.append('sku', sku);
    formData.append('imageUrl', imageUrl);

    const res = await createProduct(formData);
    if (res.success && res.product) {
      setProducts([res.product, ...products]);
      setShowAddModal(false);
      setName(''); setDescription(''); setPrice(''); setStockLevel(''); setBrand(''); setSku(''); setImageUrl('');
    } else {
      alert("Failed to add product");
    }
    setLoading(false);
  }

  async function handleUpdatePrice(id: string) {
    const val = parseFloat(newPrice);
    if (isNaN(val)) return;
    const res = await updateProductPrice(id, val);
    if (res.success) {
      setProducts(products.map(p => p.id === id ? { ...p, price: val } : p));
      setEditingPriceId(null);
    }
  }

  async function handleToggleStatus(id: string, currentStock: number) {
    const newStock = currentStock > 0 ? 0 : 10;
    const res = await updateProductStatus(id, newStock);
    if (res.success) {
      setProducts(products.map(p => p.id === id ? { ...p, stockLevel: newStock } : p));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts(products.filter(p => p.id !== id));
    }
  }

  function openEditModal(item: any) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setCategory(item.category);
    setStockLevel(item.stockLevel.toString());
    setBrand(item.brand || '');
    setSku(item.sku || '');
    setImageUrl(item.imageUrl || '');
    setShowEditModal(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('stockLevel', stockLevel);
    formData.append('brand', brand);
    formData.append('sku', sku);
    formData.append('imageUrl', imageUrl);

    const res = await editProduct(editingId, formData);
    if (res.success) {
      setProducts(products.map(p => p.id === editingId ? {
        ...p, name, description, price: parseFloat(price), category, stockLevel: parseInt(stockLevel, 10), brand, sku, imageUrl
      } : p));
      setShowEditModal(false);
      setName(''); setDescription(''); setPrice(''); setStockLevel(''); setBrand(''); setSku(''); setImageUrl(''); setEditingId('');
    } else {
      alert("Failed to update product");
    }
    setLoading(false);
  }

  // --- NEW WORKFLOW ACTIONS ---
  async function handleSimulateSale(id: string) {
    setLoading(true);
    const res = await simulateSale(id);
    if (res.success) {
      setProducts(products.map(p => p.id === id ? { ...p, stockLevel: res.newStock } : p));
      if (res.poDrafted) {
         alert("Stock dropped below safety threshold! A new DRAFT Purchase Order has been automatically created in the Procurement tab.");
         // In a real app we'd fetch the new PO or mutate local state. 
         // Reloading the page for simplicity to get fresh POs from server since server action revalidated.
         window.location.reload();
      }
    }
    setLoading(false);
  }

  async function handleApprovePO(poId: string) {
    setLoading(true);
    const res = await approvePO(poId);
    if (res.success) {
      setPos(pos.map(p => p.id === poId ? { ...p, status: 'APPROVED' } : p));
    }
    setLoading(false);
  }

  async function handleReceivePO(poId: string, quantity: number, productId: string) {
    setLoading(true);
    const res = await receivePO(poId);
    if (res.success) {
      setPos(pos.map(p => p.id === poId ? { ...p, status: 'RECEIVED' } : p));
      setProducts(products.map(p => p.id === productId ? { ...p, stockLevel: p.stockLevel + quantity } : p));
      alert("Goods received! Stock has been automatically updated.");
    }
    setLoading(false);
  }

  async function handleProcessTransaction(orderIds: string[]) {
    setLoading(true);
    const res = await processTransaction(orderIds);
    if (res.success) {
      setOrders(orders.map((o: any) => orderIds.includes(o.id) ? { ...o, status: 'SHIPPED' } : o));
      if (res.poDrafted) {
         alert("Transaction approved! Stock dropped below safety threshold. A new DRAFT Purchase Order has been automatically created in the Procurement tab.");
      }
      window.location.reload(); // Reload to fetch fresh product stock
    } else {
      alert(res.message || "Failed to process transaction.");
    }
    setLoading(false);
  }

  async function handleDeleteTransaction(orderIds: string[]) {
    if (!confirm("Are you sure you want to delete this transaction history?")) return;
    setLoading(true);
    const res = await deleteTransaction(orderIds);
    if (res.success) {
      setOrders(orders.filter((o: any) => !orderIds.includes(o.id)));
    } else {
      alert("Failed to delete transaction.");
    }
    setLoading(false);
  }

  // Grouping logic for orders
  const groupedOrders = orders.reduce((acc: any, order: any) => {
     const validDate = order.updatedAt || order.createdAt || new Date().toISOString();
     const dateKey = new Date(validDate).toISOString().substring(0, 16);
     const groupKey = `${order.userId}-${dateKey}`;
     if (!acc[groupKey]) {
        acc[groupKey] = {
           id: groupKey,
           user: order.user,
           date: order.createdAt,
           status: order.status,
           items: [],
           orderIds: []
        };
     }
     acc[groupKey].items.push({
        product: order.product,
        quantity: order.quantity,
        status: order.status
     });
     acc[groupKey].orderIds.push(order.id);
     
     if (order.status === 'PROCESSING') acc[groupKey].status = 'PROCESSING';
     return acc;
  }, {});

  const transactionList = Object.values(groupedOrders).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="w-full">
       {/* Dashboard Navigation */}
       <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
         {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex-1 py-3 px-6 rounded-xl font-bold whitespace-nowrap transition-all duration-200 ${
               activeTab === tab.id 
                 ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                 : 'text-slate-500 hover:bg-slate-100'
             }`}
           >
             {tab.label}
           </button>
         ))}
       </div>

       {/* TAB CONTENT: INVENTORY */}
       {activeTab === 'inventory' && (
         <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
               <div>
                 <h2 className="text-2xl font-black text-slate-900">Smart Inventory Control</h2>
                 <p className="text-slate-500 text-sm mt-1">Manage stock, simulate sales, and view landed costs.</p>
               </div>
               <button onClick={() => setShowAddModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl transition-colors">
                 + Add Item
               </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-sm uppercase text-slate-400 font-black tracking-wider">
                    <th className="p-4">Item</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Landed Cost (Calc)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => {
                     // Mock Landed Cost Calculation
                     const shippingCost = 15000;
                     const baseCost = item.costPrice > 0 ? item.costPrice : (item.price * 0.6); // mock cost if 0
                     const landedCost = baseCost + shippingCost;
                     const margin = item.price - landedCost;
                     const marginPercent = ((margin / item.price) * 100).toFixed(1);

                     return (
                       <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                         <td className="p-4">
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                  {item.imageUrl ? (
                                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                     <span className="text-xl">📦</span>
                                  )}
                               </div>
                               <div>
                                  <div className="font-bold text-slate-800">{item.name}</div>
                                  <div className="text-xs text-slate-400 font-medium">Category: {item.category} {item.sku && `| SKU: ${item.sku}`}</div>
                               </div>
                            </div>
                         </td>
                         <td className="p-4">
                            <div className="font-black text-lg text-slate-700">{item.stockLevel}</div>
                            <div className="text-xs text-slate-400">Thresh: {item.safetyStock}</div>
                         </td>
                         <td className="p-4">
                            <div className="text-sm font-bold text-slate-700">Rp {item.price.toLocaleString('id-ID')} (Sell)</div>
                            <div className="text-xs text-green-600 font-bold">Margin: {marginPercent}% (Rp {margin.toLocaleString('id-ID')})</div>
                         </td>
                         <td className="p-4">
                            {item.stockLevel > item.safetyStock ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black tracking-wider">Healthy</span>
                            ) : item.stockLevel > 0 ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black tracking-wider">Low Stock</span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black tracking-wider">Sold Out</span>
                            )}
                         </td>
                         <td className="p-4 text-right space-x-2 flex justify-end">
                            <button disabled={loading || item.stockLevel <= 0} onClick={() => handleSimulateSale(item.id)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50">
                              -1 Sale
                            </button>
                            <button onClick={() => openEditModal(item)} className="text-xs font-bold text-orange-500 hover:text-orange-700 px-2">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-500 hover:text-red-700 px-2">Del</button>
                         </td>
                       </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
         </div>
       )}

       {/* TAB CONTENT: PROCUREMENT */}
       {activeTab === 'procurement' && (
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Purchase Orders</h2>
                  <p className="text-slate-500 text-sm mb-6">Automated drafts requiring your approval.</p>
                  <div className="space-y-4">
                     {pos.length === 0 && <p className="text-slate-400 font-medium">No active purchase orders.</p>}
                     {pos.map(po => (
                        <div key={po.id} className="border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                           <div className="flex justify-between items-start">
                              <div>
                                 <div className="font-bold text-slate-800 text-lg">{po.product?.name || 'Unknown Product'}</div>
                                 <div className="text-sm text-slate-500">Supplier: {po.supplier?.name || 'Unknown Supplier'}</div>
                              </div>
                              {po.status === 'DRAFT' && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black">Draft</span>}
                              {po.status === 'APPROVED' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">Approved</span>}
                              {po.status === 'RECEIVED' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">Received</span>}
                           </div>
                           <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                              <div>
                                 <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Qty Requested</div>
                                 <div className="font-black text-slate-700">{po.quantity} units</div>
                              </div>
                              {po.status === 'DRAFT' && (
                                 <button disabled={loading} onClick={() => handleApprovePO(po.id)} className="bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors">
                                    Approve PO
                                 </button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Supplier Performance</h2>
                  <p className="text-slate-500 text-sm mb-6">Scorecard for quality and delivery times.</p>
                  <div className="space-y-4">
                     {suppliers.length === 0 && <p className="text-slate-400 font-medium">No suppliers registered.</p>}
                     {suppliers.map(sup => (
                        <div key={sup.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                            <div>
                               <div className="font-bold text-slate-800">{sup.name}</div>
                               <div className="text-xs text-slate-400">{sup.contactInfo || 'No contact info'}</div>
                               {sup.address && <div className="text-xs text-slate-500 mt-1">📍 {sup.address}</div>}
                            </div>
                           <div className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                 <span className="text-yellow-400">★</span>
                                 <span className="font-black text-lg text-slate-700">{sup.rating.toFixed(1)}</span>
                              </div>
                              {sup.rating < 3.0 && <div className="text-[10px] text-red-500 font-bold uppercase">Action Required</div>}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
       )}

       {/* TAB CONTENT: LOGISTICS */}
       {activeTab === 'logistics' && (
         <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl shadow-orange-500/10 border border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <svg className="w-32 h-32 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15M5 15.91l6 3.38v-6.71L5 9.21v6.7m14 0v-6.7l-6 3.38v6.71l6-3.38z"/></svg>
               </div>
               <h2 className="text-2xl font-black text-white mb-2 relative z-10">Digital Receiving & QR Mock</h2>
               <p className="text-slate-400 text-sm mb-6 relative z-10">Scan arriving goods to update inventory.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {pos.filter(p => p.status === 'APPROVED').length === 0 && (
                     <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <p className="text-slate-400">No approved POs waiting for delivery.</p>
                     </div>
                  )}
                  {pos.filter(p => p.status === 'APPROVED').map(po => (
                     <div key={po.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <div className="font-bold text-white">{po.product?.name}</div>
                              <div className="text-sm text-slate-300">From: {po.supplier?.name}</div>
                           </div>
                           <div className="bg-orange-500 text-white font-black text-xs px-2 py-1 rounded">
                              {po.quantity} pcs
                           </div>
                        </div>
                        <button disabled={loading} onClick={() => handleReceivePO(po.id, po.quantity, po.productId)} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                           Scan QR & Receive
                        </button>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
               <h2 className="text-2xl font-black text-slate-900 mb-6">Delivery Dispatch Center</h2>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                     <div className="flex-1">
                        <div className="font-bold text-slate-800">Order #HH-9821 (Lalamove)</div>
                        <div className="text-sm text-slate-500">Route: Warehouse A → Jakarta Selatan</div>
                     </div>
                     <div className="text-right">
                        <span className="text-xs font-bold text-blue-600 uppercase">On Route</span>
                        <div className="text-sm font-bold text-slate-700">ETA: 45 Mins</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="bg-green-100 p-3 rounded-lg text-green-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>
                     <div className="flex-1">
                        <div className="font-bold text-slate-800">Order #HH-9820 (JNE Cargo)</div>
                        <div className="text-sm text-slate-500">Route: Warehouse B → Bandung</div>
                     </div>
                     <div className="text-right">
                        <span className="text-xs font-bold text-green-600 uppercase">Delivered</span>
                        <div className="text-sm font-bold text-slate-700">12:30 PM</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
       )}

       {/* TAB CONTENT: CUSTOMER ORDERS */}
       {activeTab === 'orders' && (
         <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Customer Transactions</h2>
            <p className="text-slate-500 text-sm mb-6">Review and process customer purchases for shipping.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-sm uppercase text-slate-400 font-black tracking-wider">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Purchased Items</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Status & Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionList.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">No customer transactions found.</td>
                     </tr>
                  )}
                  {transactionList.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 align-top pt-6">
                         <div className="font-bold text-slate-800">{tx.user?.name || 'Customer'}</div>
                         <div className="text-xs text-slate-400">{tx.user?.email}</div>
                      </td>
                      <td className="p-4 align-top pt-6">
                         <div className="space-y-3">
                           {tx.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                 <span className="font-bold text-slate-700">{item.product?.name}</span>
                                 <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-black ml-4">{item.quantity} pcs</span>
                              </div>
                           ))}
                         </div>
                      </td>
                      <td className="p-4 align-top pt-6 text-sm text-slate-500 font-medium">
                         {new Date(tx.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-4 text-right align-top pt-6">
                         <div className="flex justify-end items-center mb-3">
                           {tx.status === 'PROCESSING' && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black tracking-wider">Processing</span>
                           )}
                           {tx.status === 'SHIPPED' && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black tracking-wider">Shipped</span>
                           )}
                         </div>
                         <div className="flex justify-end items-center">
                           {tx.status === 'PROCESSING' && (
                              <button disabled={loading} onClick={() => handleProcessTransaction(tx.orderIds)} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">
                                Approve & Ship
                              </button>
                           )}
                           {tx.status === 'SHIPPED' && (
                              <button disabled={loading} onClick={() => handleDeleteTransaction(tx.orderIds)} className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-white hover:bg-red-500 border border-red-200 text-xs font-bold py-2 px-4 rounded-lg transition-colors">
                                Delete History
                              </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
       )}

       {/* TAB CONTENT: ANALYTICS */}
       {activeTab === 'analytics' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 p-3 rounded-xl text-red-600">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-900">Dead Stock Alert</h2>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slow Moving Inventory</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {products.filter(p => p.stockLevel > 20).length === 0 && (
                     <p className="text-slate-500">No dead stock detected.</p>
                  )}
                  {products.filter(p => p.stockLevel > 20).slice(0, 3).map(p => (
                     <div key={p.id} className="p-4 border border-red-100 bg-red-50/50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-slate-800">{p.name}</div>
                           <div className="text-red-600 font-black text-sm">{p.stockLevel} units</div>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Item hasn't moved significantly in 30 days. High storage cost detected.</p>
                        <button className="text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
                           Create Promo Bundle
                        </button>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-900">Demand Forecasting</h2>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trend Predictions</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {products.filter(p => p.stockLevel < p.safetyStock).length === 0 && (
                     <p className="text-slate-500">All stock levels are optimal.</p>
                  )}
                  {products.filter(p => p.stockLevel < p.safetyStock).map(p => (
                     <div key={p.id} className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-slate-800">{p.name}</div>
                        </div>
                        <p className="text-xs text-slate-600">
                           Current stock (<span className="font-bold text-red-500">{p.stockLevel}</span>) is below safety threshold ({p.safetyStock}).
                           Based on upcoming season trends, recommended restock is <span className="font-bold text-slate-900">50 units</span>.
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
       )}

       {/* Add / Edit Modals Below (hidden unless state is true) */}
       {showAddModal && (
         <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
             <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
             <h3 className="text-2xl font-black mb-6 text-slate-900">Add New Property / Item</h3>
             <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                   <input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Description / Location</label>
                   <input required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Price (Rp)</label>
                     <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Stock Level</label>
                     <input required type="number" value={stockLevel} onChange={e => setStockLevel(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                     <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none">
                        <option value="POWER_TOOLS">Power Tools</option>
                        <option value="HAND_TOOLS">Hand Tools</option>
                        <option value="HARDWARE">Hardware (Property)</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Brand</label>
                     <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">SKU (Stock Keeping Unit)</label>
                   <input value={sku} onChange={e => setSku(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Optional SKU code" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                   <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                   {imageUrl && (
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline mt-1 inline-block">
                         🔗 Preview Image
                      </a>
                   )}
                </div>
                <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3 mt-4 rounded-xl hover:bg-slate-800 disabled:opacity-50">
                   {loading ? 'Saving...' : 'Save Item'}
                </button>
             </form>
           </div>
         </div>
       )}

       {showEditModal && (
         <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
             <h3 className="text-2xl font-black mb-6 text-slate-900">Edit Property / Item</h3>
             <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Same form inputs as Add */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                   <input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Description / Location</label>
                   <input required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Price (Rp)</label>
                     <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Stock Level</label>
                     <input required type="number" value={stockLevel} onChange={e => setStockLevel(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                     <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none">
                        <option value="POWER_TOOLS">Power Tools</option>
                        <option value="HAND_TOOLS">Hand Tools</option>
                        <option value="HARDWARE">Hardware (Property)</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Brand</label>
                     <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">SKU (Stock Keeping Unit)</label>
                   <input value={sku} onChange={e => setSku(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Optional SKU code" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                   <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                   {imageUrl && (
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline mt-1 inline-block">
                         🔗 Preview Image
                      </a>
                   )}
                </div>
                <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-bold py-3 mt-4 rounded-xl hover:bg-slate-800 disabled:opacity-50">
                   {loading ? 'Saving...' : 'Update Item'}
                </button>
             </form>
           </div>
         </div>
       )}

    </div>
  );
}
