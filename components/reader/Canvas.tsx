"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, ChevronLeft, Search, List, Type, Loader2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import dynamic from "next/dynamic";

// Dynamically import react-pageflip to avoid SSR crashes
// @ts-expect-error
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

type ParagraphNode = {
  id: number;
  type: string;
  text: string;
};

interface CanvasProps {
  bookId?: string;
  content?: ParagraphNode[];
}

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>((props, ref) => {
  return (
    <div className={clsx("page bg-transparent overflow-hidden", props.className)} ref={ref}>
      {props.children}
    </div>
  );
});
Page.displayName = 'Page';

export default function Canvas({ bookId, content }: CanvasProps) {
  const [theme, setTheme] = useState<"day" | "sepia" | "dark">("day");
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "opendyslexic">("serif");
  
  const [showUI, setShowUI] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const parentRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [maxPages, setMaxPages] = useState(0);

  // EPUB Chapter State
  const [chapterContent, setChapterContent] = useState<ParagraphNode[]>(content || []);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [totalChapters, setTotalChapters] = useState(1);
  const [isLoadingChapter, setIsLoadingChapter] = useState(bookId ? true : false);
  const [bookTitle, setBookTitle] = useState("Alice's Adventures...");
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

  // Load progress from API
  useEffect(() => {
    if (!bookId) return;
    const fetchBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmark?bookId=${bookId}`);
        if (res.ok) {
          const { chapter, page } = await res.json();
          if (typeof chapter === 'number') setCurrentChapterIndex(chapter);
          if (typeof page === 'number') setCurrentPage(page);
        }
      } catch (e) {
        console.error("Failed to load progress", e);
      }
      setHasLoadedProgress(true);
    };
    fetchBookmark();
  }, [bookId]);

  // Fetch Chapter
  useEffect(() => {
    if (!bookId || !hasLoadedProgress) return;
    const fetchChapter = async () => {
      setIsLoadingChapter(true);
      try {
        const res = await fetch(`/api/book/${bookId}/chapter?index=${currentChapterIndex}`);
        if (res.ok) {
          const data = await res.json();
          setChapterContent(data.content);
          setTotalChapters(data.totalChapters);
          setBookTitle(data.title);
          // Removed setCurrentPage(0) so we don't erase the loaded progress!
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingChapter(false);
      }
    };
    fetchChapter();
  }, [bookId, currentChapterIndex, hasLoadedProgress]);

  // Measurement Engine
  useEffect(() => {
    setMounted(true);
    
    const updateMeasurements = () => {
      if (parentRef.current && motionRef.current && !isLoadingChapter) {
        const cw = parentRef.current.clientWidth;
        const sw = parentRef.current.scrollWidth;
        const isMob = window.innerWidth < 768;
        
        setIsMobile(isMob);
        setContainerWidth(cw);
        
        const pw = Math.floor(isMob ? cw : cw / 2);
        const calculatedMax = Math.max(1, Math.ceil(sw / pw));
        setMaxPages(calculatedMax);
        setCurrentPage(p => Math.min(p, calculatedMax - 1));
      }
    };

    updateMeasurements();
    const t1 = setTimeout(updateMeasurements, 100);
    const t2 = setTimeout(updateMeasurements, 500);

    const observer = new ResizeObserver(() => updateMeasurements());
    if (parentRef.current) observer.observe(parentRef.current);
    window.addEventListener('resize', updateMeasurements);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [fontSize, fontFamily, chapterContent, isLoadingChapter]);

  // Jump to the saved page instantly when the book layout engine finishes calculating maxPages
  useEffect(() => {
    if (maxPages > 0 && flipBookRef.current) {
      const pageFlip = flipBookRef.current.pageFlip();
      if (pageFlip && currentPage > 0 && currentPage < maxPages) {
        pageFlip.turnToPage(currentPage);
      }
    }
  }, [maxPages, currentPage]);

  const saveProgress = (newChapter: number, newPage: number) => {
    fetch('/api/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, chapter: newChapter, page: newPage })
    }).catch(e => console.error('Failed to save bookmark', e));
  };

  const changeChapter = (newIndex: number) => {
    setCurrentChapterIndex(newIndex);
    setCurrentPage(0);
    saveProgress(newIndex, 0);
  };

  const handleNextPage = () => {
    const pagesPerView = isMobile ? 1 : 2;
    if (currentPage >= maxPages - pagesPerView) {
      if (currentChapterIndex < totalChapters - 1) {
        changeChapter(currentChapterIndex + 1);
        return;
      }
    }
    flipBookRef.current?.pageFlip().flipNext();
  };

  const handlePrevPage = () => {
    if (currentPage === 0) {
      if (currentChapterIndex > 0) {
        changeChapter(currentChapterIndex - 1);
        return;
      }
    }
    flipBookRef.current?.pageFlip().flipPrev();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextPage();
      if (e.key === "ArrowLeft") handlePrevPage();
      if (e.key === "Escape") setShowUI(!showUI);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUI, currentPage, maxPages, currentChapterIndex, totalChapters, isMobile]);

  const pageWidth = isMobile ? containerWidth : containerWidth / 2;

  const pageStyles = {
    columnWidth: pageWidth > 0 ? `${pageWidth}px` : (isMobile ? '100vw' : '50vw'),
    columnGap: "0px",
    height: "100%",
    fontSize: `${fontSize}px`,
    lineHeight: "1.6",
  };

  const textContent = (
    <div className={clsx(isMobile ? "px-[6vw]" : "px-[4vw]")}>
      {chapterContent.map((node, i) => (
        <p 
          key={node.id} 
          className={clsx(
            "mb-5 text-justify hyphen-auto",
            i === 0 && "first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-0.15em] first-letter:leading-none"
          )}
        >
          {node.text}
        </p>
      ))}
    </div>
  );

  if (!mounted) return null;

  return (
    <div className={clsx(
      "fixed inset-0 w-full h-[100dvh] overflow-hidden transition-colors duration-500 select-none flex items-center justify-center font-sans",
      theme === "day" && "bg-white",
      theme === "sepia" && "bg-[#f4ecd8]",
      theme === "dark" && "bg-black" 
    )}>
      
      {/* Mobile-First Premium iOS-style Header */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 inset-x-0 h-[env(safe-area-inset-top,0px)+64px] pt-[env(safe-area-inset-top,0px)] bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-xl flex items-center justify-between px-4 z-50 border-b border-black/5 dark:border-white/10 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <span className="font-semibold text-sm truncate max-w-[150px] md:max-w-[200px] text-black dark:text-white">{bookTitle}</span>
            </div>
            
            <div className="flex items-center gap-1 text-black dark:text-white">
              <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={clsx("p-2 rounded-full transition-colors", isBookmarked ? "text-[#ff2d55]" : "hover:bg-black/5 dark:hover:bg-white/10")}
              >
                <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reflowable Reader Canvas */}
      <div 
        className="w-full h-full relative flex items-center justify-center"
        onClickCapture={(e) => {
          const isRightEdge = e.clientX > window.innerWidth * 0.7;
          const isLeftEdge = e.clientX < window.innerWidth * 0.3;
          
          if (isRightEdge && currentPage >= maxPages - (isMobile ? 1 : 2)) {
            if (currentChapterIndex < totalChapters - 1) {
              changeChapter(currentChapterIndex + 1);
            }
          } else if (isLeftEdge && currentPage === 0) {
            if (currentChapterIndex > 0) {
              changeChapter(currentChapterIndex - 1);
            }
          } else if (!isRightEdge && !isLeftEdge) {
            setShowUI(!showUI);
          }
        }}
      >
        
        <div className={clsx(
          "w-full h-full relative transition-all duration-500 flex items-center justify-center",
          !isMobile && (theme === "day" ? "bg-[#e5e5e5] p-2 md:p-8" : "bg-[#111] p-2 md:p-8") 
        )}>
          {/* Inner pages container */}
          <div 
            className={clsx(
              "w-full max-w-6xl h-full overflow-hidden relative flex items-center justify-center",
              !isMobile && "shadow-2xl rounded-sm",
              theme === "day" && "bg-white text-[#111]",
              theme === "sepia" && "bg-[#f4ecd8] text-[#5f4b32]",
              theme === "dark" && "bg-black text-[#b0b0b0]", 
              fontFamily === "serif" ? "font-serif" : fontFamily === "sans" ? "font-sans" : "font-opendyslexic"
            )}
          >
            {isLoadingChapter ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-semibold tracking-widest uppercase">Loading Chapter...</span>
              </div>
            ) : (
              <>
                {/* HIDDEN MEASUREMENT CONTAINER */}
                <div className="absolute opacity-0 pointer-events-none z-[-1] w-full h-full overflow-hidden" ref={parentRef}>
                  <div ref={motionRef} className="h-full pt-16 pb-20 md:pt-20 md:pb-20" style={pageStyles}>
                    {textContent}
                  </div>
                </div>

                {/* REACT-PAGEFLIP 3D ENGINE */}
                <div className="relative w-full h-full z-10 pointer-events-none">
                  {maxPages > 0 && containerWidth > 0 && parentRef.current && (
                    <HTMLFlipBook
                      key={`${maxPages}-${containerWidth}-${currentChapterIndex}`}
                      width={pageWidth}
                      height={parentRef.current.clientHeight}
                      size="fixed"
                      minWidth={200}
                      maxWidth={2000}
                      minHeight={300}
                      maxHeight={2000}
                      maxShadowOpacity={0.3}
                      showCover={false}
                      mobileScrollSupport={false} // Disable to let our tap zones handle it cleanly
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onFlip={(e: any) => {
                        setCurrentPage(e.data);
                        saveProgress(currentChapterIndex, e.data);
                      }}
                      className="html-book pointer-events-auto"
                      ref={flipBookRef}
                    >
                      {Array.from({ length: maxPages }).map((_, i) => {
                        // VIRTUALIZATION HACK:
                        // A full book chapter can be 150+ pages. If we duplicate the entire 
                        // HTML text block for all 150 pages, the browser tries to render 
                        // 1,000,000+ DOM nodes and silently crashes into a white screen!
                        // By only rendering the text for the adjacent pages, we keep the DOM tiny 
                        // and 60fps fast, while keeping the full 3D physics engine!
                        const isNear = Math.abs(currentPage - i) <= 3;

                        return (
                          <Page 
                            key={i} 
                            className={clsx(
                              theme === "day" && "bg-white",
                              theme === "sepia" && "bg-[#f4ecd8]",
                              theme === "dark" && "bg-black"
                            )}
                          >
                            <div className="w-full h-full overflow-hidden relative">
                              {isNear && (
                                <div 
                                  className="h-full pt-16 pb-20 md:pt-20 md:pb-20 absolute top-0 bottom-0"
                                  style={{
                                    ...pageStyles,
                                    width: `${maxPages * pageWidth}px`,
                                    left: `-${i * pageWidth}px`
                                  }}
                                >
                                  {textContent}
                                </div>
                              )}
                            </div>
                          </Page>
                        );
                      })}
                    </HTMLFlipBook>
                  )}
                </div>
              </>
            )}

            {/* Desktop Spine Shadow & Book Page Edges */}
            {!isMobile && !isLoadingChapter && (
              <>
                <div className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-0 shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)] pointer-events-none z-10"></div>
              </>
            )}

            {/* Subtly beautiful E-reader footer */}
            {!isLoadingChapter && (
              <div className="absolute bottom-4 md:bottom-6 inset-x-6 md:inset-x-10 flex justify-between items-center opacity-30 text-[10px] tracking-wider font-sans pointer-events-none z-10">
                <span>Ch. {currentChapterIndex + 1} of {totalChapters}</span>
                <span>{Math.round((currentPage / Math.max(1, maxPages - 1)) * 100)}%</span>
              </div>
            )}
            
            {/* Slim Book Progress Bar (Persistent) */}
            {!isLoadingChapter && (
              <div className="absolute bottom-0 inset-x-0 h-1 bg-black/5 dark:bg-white/5 z-10">
                <div 
                  className="h-full bg-black dark:bg-white opacity-20 transition-all duration-300"
                  style={{ width: `${maxPages > 1 ? (currentPage / (maxPages - 1)) * 100 : 100}%` }}
                ></div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile-First Premium iOS-style Footer & Settings */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 inset-x-0 bg-white/90 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 z-50 text-black dark:text-white px-5 pb-[env(safe-area-inset-bottom,20px)] pt-5 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] font-sans"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="max-w-md mx-auto space-y-6">
              
              {/* Scrub bar */}
              <div className="flex items-center gap-4 px-2">
                <span className="text-[10px] font-semibold opacity-50 uppercase tracking-wider">1</span>
                <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                   <div 
                     className="absolute left-0 top-0 bottom-0 bg-black dark:bg-white rounded-full transition-all duration-300"
                     style={{ width: `${maxPages > 1 ? (currentPage / (maxPages - 1)) * 100 : 100}%` }}
                   ></div>
                </div>
                <span className="text-[10px] font-semibold opacity-50 uppercase tracking-wider">{Math.max(maxPages, 1)}</span>
              </div>

              {/* iOS Style Segmented Controls for Theme */}
              <div className="bg-black/5 dark:bg-white/10 p-1 rounded-xl flex shadow-inner">
                <button 
                  onClick={() => setTheme("day")}
                  className={clsx("flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2", theme === "day" ? "bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white" : "text-black/60 dark:text-white/60")}
                >
                  Day
                </button>
                <button 
                  onClick={() => setTheme("sepia")}
                  className={clsx("flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2", theme === "sepia" ? "bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white" : "text-black/60 dark:text-white/60")}
                >
                  Sepia
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={clsx("flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2", theme === "dark" ? "bg-white dark:bg-[#2c2c2e] shadow-sm text-black dark:text-white" : "text-black/60 dark:text-white/60")}
                >
                  Dark
                </button>
              </div>

              {/* Font Controls */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setFontFamily(f => f === "serif" ? "sans" : "serif")}
                  className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 transition-colors"
                >
                  <Type className="w-5 h-5" />
                </button>
                
                <div className="flex-1 flex items-center bg-black/5 dark:bg-white/10 rounded-full p-1 shadow-inner">
                  <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="flex-1 py-2.5 text-lg font-medium hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors">A-</button>
                  <div className="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                  <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="flex-1 py-2.5 text-lg font-medium hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors">A+</button>
                </div>

                <button className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 transition-colors">
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
