import { NextResponse } from 'next/server';
import { EPub } from 'epub2';
import { parse } from 'node-html-parser';
import path from 'path';
import fs from 'fs';

export async function GET(request: Request, { params }: { params: { bookId: string } }) {
  const { searchParams } = new URL(request.url);
  const chapterIndexStr = searchParams.get('index');
  const chapterIndex = parseInt(chapterIndexStr || '0', 10);
  const bookId = params.bookId;

  try {
    const bookPath = path.join(process.cwd(), 'public', 'books', `${bookId}.epub`);
    
    if (!fs.existsSync(bookPath)) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const cacheDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'public');
    const cachePath = path.join(cacheDir, `kindleify-cache-${bookId}-${chapterIndex}.json`);

    if (fs.existsSync(cachePath)) {
      const cachedData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      return NextResponse.json(cachedData);
    }

    const epub = await EPub.createAsync(bookPath);
    
    const chapters = epub.flow;
    if (chapterIndex < 0 || chapterIndex >= chapters.length) {
      return NextResponse.json({ error: 'Chapter out of bounds' }, { status: 404 });
    }

    const chapterId = chapters[chapterIndex].id;
    const html = await epub.getChapterRawAsync(chapterId);

    // Use fast, Next-compatible node-html-parser
    const root = parse(html);
    
    // We look for all paragraph-like tags
    const elements = root.querySelectorAll('p, h1, h2, h3, div');
    
    let contentNodes: { id: number; type: string; text: string }[] = [];
    let idCounter = 1;

    elements.forEach((el) => {
      // Filter out empty elements or pure structural divs
      const text = el.textContent?.trim();
      if (!text || text.length === 0) return;
      
      // If a div just contains a p, the p will be caught separately
      if (el.tagName.toLowerCase() === 'div' && el.querySelector('p')) return;

      // Clean up text content (remove internal newlines/tabs from EPUB formatting)
      const cleanText = text.replace(/\s+/g, ' ').trim();

      contentNodes.push({
        id: idCounter++,
        type: el.tagName.toLowerCase(),
        text: cleanText
      });
    });

    // If no nodes found, fallback to body text
    if (contentNodes.length === 0) {
      const body = root.querySelector('body');
      const bodyText = body ? body.textContent?.trim() : root.textContent?.trim();
      if (bodyText) {
        contentNodes = bodyText.split('\n').filter(t => t.trim().length > 0).map((t, i) => ({
          id: i,
          type: 'p',
          text: t.replace(/\s+/g, ' ').trim()
        }));
      }
    }

    // Final fallback for completely empty chapters (e.g., Cover Images)
    if (contentNodes.length === 0) {
      contentNodes.push({
        id: 1,
        type: 'p',
        text: '[Illustration or Cover Page]'
      });
    }

    const responseData = {
      title: epub.metadata.title,
      chapterTitle: chapters[chapterIndex].title || `Chapter ${chapterIndex + 1}`,
      totalChapters: chapters.length,
      currentChapterIndex: chapterIndex,
      content: contentNodes
    };

    try {
      fs.writeFileSync(cachePath, JSON.stringify(responseData));
    } catch (cacheErr) {
      console.warn("Failed to write to cache:", cacheErr);
    }

    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error("EPUB Parse Error:", error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to parse EPUB' }, { status: 500 });
  }
}
