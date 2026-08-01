"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] text-white selection:bg-purple-500/30">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-200">The Next-Gen Reading Experience</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
        >
          Turn static PDFs into beautiful, reflowable books.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed"
        >
          Kindleify parses your rigid documents and reconstructs them into dynamic, 
          eye-friendly formats. Read effortlessly across all your devices.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Open Your Library
            </span>
          </Link>
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-medium backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* Decorative Mockup Element */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="absolute -bottom-[30%] md:-bottom-[40%] w-full max-w-5xl px-4 pointer-events-none"
      >
        <div className="relative aspect-[16/9] rounded-t-3xl border-t border-x border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden flex items-start justify-center pt-8">
           <div className="w-[80%] h-32 bg-gradient-to-b from-white/5 to-transparent rounded-t-2xl border-t border-x border-white/5"></div>
        </div>
      </motion.div>
    </main>
  );
}
