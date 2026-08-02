"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookOpen, Play, RotateCcw, X, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  title: string;
  author: string;
}

interface SavedProgress {
  chapter: number;
  page: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [progressMap, setProgressMap] = useState<Record<string, SavedProgress>>({});
  const [selectedBook, setSelectedBook] = useState<{ book: Book; progress: SavedProgress } | null>(null);

  const books: Book[] = [
    {
      id: "The Kind Worth Killing",
      title: "The Kind Worth Killing",
      author: "Peter Swanson",
    }
  ];

  useEffect(() => {
    const loadedMap: Record<string, SavedProgress> = {};
    books.forEach((book) => {
      try {
        const saved = localStorage.getItem(`bookmark-${book.id}`);
        if (saved) {
          loadedMap[book.id] = JSON.parse(saved);
        }
      } catch (e) {
        console.error(e);
      }
    });
    setProgressMap(loadedMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookClick = (book: Book) => {
    const prog = progressMap[book.id];
    if (prog && (prog.chapter > 0 || prog.page > 0)) {
      setSelectedBook({ book, progress: prog });
    } else {
      router.push(`/reader/${encodeURIComponent(book.id)}`);
    }
  };

  const handleContinue = () => {
    if (!selectedBook) return;
    router.push(`/reader/${encodeURIComponent(selectedBook.book.id)}`);
  };

  const handleRestart = () => {
    if (!selectedBook) return;
    router.push(`/reader/${encodeURIComponent(selectedBook.book.id)}?restart=true`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 p-6 md:p-12 font-sans selection:bg-purple-500/30 relative overflow-hidden">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href="/" className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
            <div className="bg-white text-black p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            Kindleify
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-black rounded-full border-2 border-transparent"></div>
            </div>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
          >
            {books.map((book) => {
              const prog = progressMap[book.id];
              const hasProgress = prog && (prog.chapter > 0 || prog.page > 0);

              return (
                <div 
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  <div className="relative aspect-[2/3] w-full rounded-xl shadow-2xl overflow-hidden border border-white/10 bg-[#0f0f11] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(168,85,247,0.3)]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black flex flex-col p-4 md:p-5 justify-between">
                      <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 opacity-80 absolute top-0 left-0" />
                      
                      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                      <div className="text-right w-full pt-2 z-10 flex justify-end">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 shadow-xl flex items-center gap-1.5">
                          {hasProgress && <Bookmark className="w-3 h-3 text-purple-400 fill-purple-400" />}
                          <span className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                            {hasProgress ? `Ch. ${prog.chapter + 1}` : "Read"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="z-10 mt-auto pb-2">
                        <h3 className="text-white font-serif font-bold text-lg md:text-xl leading-tight tracking-tight line-clamp-4">{book.title}</h3>
                        <p className="text-purple-400 font-sans text-[10px] md:text-xs mt-3 uppercase tracking-widest font-bold">{book.author}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Continue Reading vs Start from Beginning Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 font-sans text-white"
            >
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Resume Reading</span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold leading-snug">{selectedBook.book.title}</h2>
                  <p className="text-xs text-zinc-400">
                    You have saved progress at <span className="text-purple-300 font-semibold">Chapter {selectedBook.progress.chapter + 1}, Page {selectedBook.progress.page + 1}</span>.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleContinue}
                    className="w-full py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-600/30 group"
                  >
                    <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                    Continue Reading
                  </button>

                  <button
                    onClick={handleRestart}
                    className="w-full py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 font-semibold text-xs text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start from Beginning
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
