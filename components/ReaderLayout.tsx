"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, Moon, Sun, Type, LayoutList, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Chapter = {
  title: string;
  subtitle: string;
  paragraphs: string[];
};

type Part = {
  title: string;
  subtitle: string;
  chapters: Chapter[];
};

type Book = {
  title: string;
  parts: Part[];
};

interface ReaderLayoutProps {
  book: Book;
}

export default function ReaderLayout({ book }: ReaderLayoutProps) {
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('font-serif');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextPage = () => {
    if (contentRef.current) {
      // Scroll by one viewport width
      contentRef.current.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
    }
  };

  const jumpToChapter = (partIndex: number, chapterIndex: number) => {
    setShowToc(false);
    
    // We need to scroll to the specific element. 
    // This is tricky with CSS columns, but standard scrollIntoView works in modern browsers for columns.
    const element = document.getElementById(`chapter-${partIndex}-${chapterIndex}`);
    if (element && contentRef.current) {
      element.scrollIntoView({ inline: 'start', behavior: 'smooth' });
    }
  };

  const themeClasses = isDarkMode 
    ? 'bg-[#121212] text-zinc-300 selection:bg-purple-900/50' 
    : 'bg-[#f4f1ea] text-zinc-800 selection:bg-purple-200';
    
  const panelClasses = isDarkMode
    ? 'bg-zinc-900/90 border-zinc-800 text-white'
    : 'bg-white/90 border-zinc-200 text-black';

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${themeClasses}`}>
      
      {/* Header */}
      <header className={`h-16 flex-none border-b ${isDarkMode ? 'border-zinc-800' : 'border-zinc-300/50'} flex items-center justify-between px-6 z-10 relative backdrop-blur-md`}>
        <Link href="/" className="font-bold tracking-tight hover:opacity-80 transition-opacity">
          Kindleify
        </Link>
        <div className="font-medium text-sm hidden md:block opacity-70">
          {book.title}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { setShowToc(!showToc); setShowSettings(false); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <LayoutList className="w-5 h-5" />
          </button>
          <button onClick={() => { setShowSettings(!showSettings); setShowToc(false); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Reading Area */}
      <main className="flex-1 relative overflow-hidden">
        
        {/* CSS Multi-Column Container */}
        <div 
          ref={contentRef}
          className={`h-full w-full overflow-x-auto overflow-y-hidden ${fontFamily}`}
          style={{
            columnWidth: '100vw',
            columnGap: '0',
            columnFill: 'auto',
            paddingTop: '2rem',
            paddingBottom: '2rem',
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            scrollSnapType: 'x mandatory',
          }}
        >
          {book.parts.map((part, partIdx) => (
            <div key={`part-${partIdx}`} className="break-before-column px-8 md:px-16 lg:px-24 max-w-4xl mx-auto scroll-snap-align-start h-full">
              {/* If we set h-full on the inner div, it forces content into columns across 100vw widths */}
              {/* Actually, it's better to wrap all content in one continuous flow, and the column layout handles the rest */}
              
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center break-after-column mb-8 mt-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{part.title}</h1>
                {part.subtitle && <h2 className="text-2xl opacity-70">{part.subtitle}</h2>}
              </div>

              {part.chapters.map((chapter, chapIdx) => (
                <div key={`chapter-${partIdx}-${chapIdx}`} id={`chapter-${partIdx}-${chapIdx}`} className="break-before-column mb-12 scroll-snap-align-start">
                  <div className="mb-12 mt-8 text-center break-inside-avoid">
                    <h2 className="text-2xl font-bold uppercase tracking-wider">{chapter.title}</h2>
                    {chapter.subtitle && <h3 className="text-xl mt-2 opacity-70">{chapter.subtitle}</h3>}
                  </div>
                  
                  <div className="text-justify text-pretty">
                    {chapter.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="mb-6 indent-8 break-inside-avoid-page">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-24 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-r from-black/5 dark:from-white/5 to-transparent cursor-pointer z-0" onClick={prevPage}>
          <ChevronLeft className="w-10 h-10" />
        </div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-24 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/5 dark:from-white/5 to-transparent cursor-pointer z-0" onClick={nextPage}>
          <ChevronRight className="w-10 h-10" />
        </div>
      </main>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute top-20 right-6 w-72 rounded-2xl p-5 border shadow-2xl z-20 backdrop-blur-xl ${panelClasses}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4"/> Display</h3>
              <button onClick={() => setShowSettings(false)}><X className="w-4 h-4 opacity-50 hover:opacity-100"/></button>
            </div>
            
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-2">Theme</p>
                <div className="flex bg-black/5 dark:bg-white/5 rounded-lg p-1">
                  <button 
                    onClick={() => setIsDarkMode(false)} 
                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-2 text-sm transition-colors ${!isDarkMode ? 'bg-white text-black shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button 
                    onClick={() => setIsDarkMode(true)} 
                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-2 text-sm transition-colors ${isDarkMode ? 'bg-zinc-800 text-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-2">Font Size</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10">
                    <Type className="w-3 h-3" />
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">{fontSize}px</span>
                  <button onClick={() => setFontSize(f => Math.min(36, f + 2))} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10">
                    <Type className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-2">Typography</p>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)}
                  className={`w-full p-2 text-sm rounded-lg outline-none appearance-none ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                >
                  <option value="font-serif">Serif (Classic)</option>
                  <option value="font-sans">Sans-serif (Modern)</option>
                  <option value="font-mono">Monospace (Code)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Table of Contents Panel */}
        {showToc && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`absolute top-16 left-0 bottom-0 w-80 border-r p-5 overflow-y-auto z-20 ${panelClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2"><LayoutList className="w-4 h-4"/> Contents</h3>
              <button onClick={() => setShowToc(false)}><X className="w-4 h-4 opacity-50 hover:opacity-100"/></button>
            </div>

            <div className="space-y-6">
              {book.parts.map((part, pIdx) => (
                <div key={pIdx}>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-90">{part.title}</h4>
                  <ul className="space-y-2 pl-2 border-l border-black/10 dark:border-white/10">
                    {part.chapters.map((chap, cIdx) => (
                      <li key={cIdx}>
                        <button 
                          onClick={() => jumpToChapter(pIdx, cIdx)}
                          className="text-sm text-left w-full hover:text-purple-500 transition-colors opacity-70 hover:opacity-100 py-1"
                        >
                          {chap.title} {chap.subtitle && <span className="opacity-60 text-xs ml-1">- {chap.subtitle}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer / Status Bar */}
      <footer className={`h-8 flex-none border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-300/50'} flex items-center justify-between px-6 text-xs opacity-50 z-10 backdrop-blur-md`}>
        <span>{book.title}</span>
        <span>Use arrow keys to navigate</span>
      </footer>
    </div>
  );
}
