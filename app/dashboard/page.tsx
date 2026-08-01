"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href="/" className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
            <div className="bg-white text-black p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            Kindleify
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-[#0a0a0a] shadow-sm"></div>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Your Library</h1>
            <p className="text-zinc-500">Pick up right where you left off.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {/* The Silent Patient Book Card */}
            <div 
              onClick={() => router.push("/reader/the-silent-patient")}
              className="group cursor-pointer flex flex-col gap-3"
            >
              <div className="relative aspect-[2/3] w-full rounded-md shadow-lg overflow-hidden border border-white/10 bg-[#161616] transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                {/* Fallback Cover Design */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col p-4 justify-between">
                  <div className="w-full h-1 bg-gradient-to-r from-red-500 to-red-800 opacity-50 absolute top-0 left-0" />
                  <div className="text-right w-full pt-4 pr-2">
                    <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase rotate-90 origin-right inline-block">Bestseller</span>
                  </div>
                  <div>
                    <h3 className="text-white font-serif font-bold text-xl leading-tight">The Silent Patient</h3>
                    <p className="text-zinc-400 font-sans text-xs mt-2 uppercase tracking-wider">Alex Michaelides</p>
                  </div>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-white font-medium text-sm truncate group-hover:text-purple-400 transition-colors">The Silent Patient</h3>
                <p className="text-zinc-500 text-xs">Alex Michaelides</p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
