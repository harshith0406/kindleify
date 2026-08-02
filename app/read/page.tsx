import fs from 'fs';
import path from 'path';
import ReaderLayout from '@/components/ReaderLayout';

// In Next.js App Router, page components are Server Components by default.
// We can read the JSON file directly from the filesystem on the server.

export default async function ReadPage() {
  const filePath = path.join(process.cwd(), 'public', 'The Kind Worth Killing.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const book = JSON.parse(fileContents);

  return (
    <ReaderLayout book={book} />
  );
}
