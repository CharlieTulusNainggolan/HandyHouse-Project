import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import CreateProductForm from "./CreateProductForm";

export default function CreateListing() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
       <Navbar />
       <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton />
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 mt-4">
             <div className="mb-10 border-b border-slate-100 pb-6">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Admin: Create Product Listing 📋</h1>
                <p className="text-slate-500 font-medium">Add a new household tool or equipment to the inventory catalog.</p>
             </div>
             
             <CreateProductForm />
          </div>
       </div>
    </main>
  );
}
