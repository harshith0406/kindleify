import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const getFilePath = () => {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'bookmark.json');
  }
  return path.join(process.cwd(), 'public', 'bookmark.json');
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');

  if (!bookId) {
    return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  }

  try {
    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ chapter: 0, page: 0 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(data[bookId] || { chapter: 0, page: 0 });
  } catch (error) {
    console.error("GET bookmark error", error);
    return NextResponse.json({ chapter: 0, page: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, chapter, page } = body;

    if (!bookId || chapter === undefined || page === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const filePath = getFilePath();
    let data: Record<string, { chapter: number; page: number }> = {};

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    data[bookId] = { chapter, page };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST bookmark error", error);
    return NextResponse.json({ error: 'Failed to save bookmark' }, { status: 500 });
  }
}
