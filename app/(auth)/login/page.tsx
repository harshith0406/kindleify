"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, keepLoggedIn })
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "invalid creds");
        setIsLoading(false);
      }
    } catch {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm mx-auto lg:mx-0"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="bg-black text-white p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Kindleify<span className="text-blue-500">.ai</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold mb-8">Login</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-500 text-sm py-3 px-4 rounded-xl font-medium border border-red-100">
                {error}
              </div>
            )}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-[#f4f6f8] text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow placeholder:text-slate-400"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#f4f6f8] text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow placeholder:text-slate-400"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center bg-white group-hover:border-purple-500 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="hidden" 
                  />
                  <div className={`w-2.5 h-2.5 bg-purple-500 rounded-sm transition-opacity ${keepLoggedIn ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className="text-slate-600 select-none">Keep me logged in</span>
              </label>
              <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-500/30"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-purple-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Visual Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f8fafc] relative overflow-hidden items-center justify-center p-16">
        
        {/* Abstract Background Elements matching the image vibe */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-blue-50/50 rounded-tl-full translate-x-1/4 translate-y-1/4" />
        
        {/* Dot pattern */}
        <div className="absolute top-32 right-32 w-32 h-32 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '16px 16px' }} />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 max-w-lg w-full"
        >
          <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Changing the way<br />you read PDFs
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Dynamic reflowable layouts, custom typography engines, and instant Whispersync library tracking.
          </p>
          
          {/* Geometric floating shapes */}
          <div className="relative h-64 mt-16 w-full">
            {/* Red Arch */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute left-0 top-10 w-28 h-36 bg-[#ff6b6b] rounded-t-full shadow-lg" 
            />
            
            {/* Blue Semi-Circle */}
            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute left-32 bottom-0 w-36 h-16 bg-[#38bdf8] rounded-b-full shadow-lg" 
            />
            
            {/* Soft Gradient Diamond */}
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [45, 45, 45] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-10 bottom-10 w-32 h-32 bg-gradient-to-tr from-indigo-100 to-white rounded-3xl shadow-xl rotate-45 border border-white" 
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
