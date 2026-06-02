import Navbar from "@/components/Navbar";
import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-orange-200">
       <Navbar />
       <div className="max-w-6xl mx-auto px-4 py-8">
           <div className="flex items-center justify-center min-h-[calc(100vh-160px)] py-8 mt-2">
              
              {/* Split Panel Container */}
              <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-[24px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200 bg-white">
                 
                 {/* Left Panel - Graphic */}
                 <div className="md:w-5/12 bg-[#c25822] relative flex flex-col items-center justify-center p-12 text-white overflow-hidden text-center">
                    
                    {/* Back Link */}
                    <Link href="/" className="absolute top-8 left-8 text-white/90 hover:text-white font-medium text-sm transition-colors z-20">
                        &lt; Home Page
                    </Link>

                    {/* Abstract Wave Pattern */}
                    <svg className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,202.7C672,203,768,149,864,138.7C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>

                    <div className="relative z-10 flex flex-col items-center justify-center w-full mt-8">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 text-white mb-6">
                         <path d="M3 10l9-7 9 7" />
                         <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                       </svg>

                       <h1 className="text-4xl md:text-5xl font-extrabold mb-12 tracking-tight">Welcome Back</h1>

                       <div className="w-full mt-8">
                         <p className="text-white/90 font-medium mb-4">Don't have an account?</p>
                         <Link href="/register" className="inline-block w-3/4 py-3 border border-white rounded-2xl font-semibold text-white hover:bg-white/10 transition-all text-center backdrop-blur-sm">
                           Sign up
                         </Link>
                       </div>
                    </div>
                 </div>

                 {/* Right Panel - Form */}
                 <div className="md:w-7/12 p-10 md:p-14 flex flex-col justify-center bg-white relative">
                    <div className="absolute top-8 right-10 text-sm font-medium text-slate-500">
                        Need help?
                    </div>
                    
                    <div className="w-full max-w-sm mx-auto">
                        <h2 className="text-3xl font-extrabold text-[#8c3e1e] mb-8 tracking-tight text-center">Log in to your account</h2>
                        <LoginForm />
                    </div>
                 </div>

              </div>
           </div>
       </div>
    </main>
  );
}
