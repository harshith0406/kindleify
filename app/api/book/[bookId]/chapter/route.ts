import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

interface Paragraph {
  id: number;
  type: string;
  text: string;
}

interface ChapterData {
  partTitle: string;
  partSubtitle: string;
  chapterTitle: string;
  chapterSubtitle: string;
  paragraphs: string[];
}

interface ParsedChapter {
  title: string;
  chapterTitle: string;
  totalChapters: number;
  currentChapterIndex: number;
  toc: string[];
  content: Paragraph[];
}

export async function GET(request: Request, { params }: { params: { bookId: string } }) {
  const { searchParams } = new URL(request.url);
  const chapterIndexStr = searchParams.get('index');
  const chapterIndex = parseInt(chapterIndexStr || '0', 10);
  const bookId = decodeURIComponent(params.bookId);

  try {
    let bookPathJson = path.join(process.cwd(), 'public', `${bookId}.json`);
    
    // Fallback logic for old URL structures
    if (!fs.existsSync(bookPathJson)) {
      if (bookId.includes('The Kind Worth Killing')) {
        bookPathJson = path.join(process.cwd(), 'public', 'The Kind Worth Killing.json');
      }
    }

    if (!fs.existsSync(bookPathJson)) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = JSON.parse(fs.readFileSync(bookPathJson, 'utf-8'));
    
    const allChapters: ChapterData[] = [];
    const toc: string[] = [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    book.parts.forEach((part: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        part.chapters.forEach((chap: any) => {
            allChapters.push({
                partTitle: part.title,
                partSubtitle: part.subtitle,
                chapterTitle: chap.title,
                chapterSubtitle: chap.subtitle,
                paragraphs: chap.paragraphs
            });
            toc.push(`${part.title}: ${chap.title} ${chap.subtitle ? '- ' + chap.subtitle : ''}`);
        });
    });

    if (chapterIndex < 0 || chapterIndex >= allChapters.length) {
       return NextResponse.json({ error: 'Chapter out of bounds' }, { status: 404 });
    }

    const chapter = allChapters[chapterIndex];
    let idCounter = 1;
    const contentNodes: Paragraph[] = [];
    
    contentNodes.push({
        id: idCounter++,
        type: 'h2',
        text: chapter.chapterTitle
    });

    chapter.paragraphs.forEach((p: string) => {
        contentNodes.push({
            id: idCounter++,
            type: 'p',
            text: p
        });
    });

    const responseData: ParsedChapter = {
        title: book.title,
        chapterTitle: `${chapter.partTitle} - ${chapter.chapterTitle}`,
        totalChapters: allChapters.length,
        currentChapterIndex: chapterIndex,
        toc: toc,
        content: contentNodes
    };
    
    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error("Book Parse Error:", error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to parse JSON book' }, { status: 500 });
  }
}
