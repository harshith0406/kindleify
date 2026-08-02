const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'the_kind_worth_killing.txt');
const outputPath = path.join(__dirname, 'public', 'book.json');

const text = fs.readFileSync(inputPath, 'utf8');
const lines = text.split(/\r?\n/);

const book = {
  title: "The Kind Worth Killing",
  parts: []
};

let currentPart = null;
let currentChapter = null;
let inContents = true;

const partRegex = /^PART\s+(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i;
const chapterRegex = /^CHAPTER\s+(\d+)$/i;

let paragraphBuffer = [];

function flushParagraph() {
  if (paragraphBuffer.length > 0 && currentChapter) {
    currentChapter.paragraphs.push(paragraphBuffer.join(' '));
    paragraphBuffer = [];
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (inContents) {
    if (line === 'PART I') {
      inContents = false;
    }
  }

  if (inContents) continue;

  if (partRegex.test(line)) {
    flushParagraph();
    currentPart = {
      title: line,
      subtitle: (lines[i+1] || '').trim(),
      chapters: []
    };
    book.parts.push(currentPart);
    i++; // skip subtitle line
    currentChapter = null;
    continue;
  }

  if (chapterRegex.test(line)) {
    flushParagraph();
    currentChapter = {
      title: line,
      subtitle: (lines[i+1] || '').trim(),
      paragraphs: []
    };
    if (currentPart) {
      currentPart.chapters.push(currentChapter);
    } else {
      // In case chapter appears without a part
      currentPart = { title: "PART", subtitle: "", chapters: [currentChapter] };
      book.parts.push(currentPart);
    }
    i++; // skip subtitle line
    continue;
  }
  
  if (line === "About the Author" || line === "Also by Peter Swanson") {
    flushParagraph();
    break;
  }

  if (currentChapter) {
    if (line === '') {
      flushParagraph();
    } else {
      paragraphBuffer.push(line);
      
      const nextLine = (lines[i+1] || '').trim();
      
      let isEndOfParagraph = false;
      
      if (nextLine === '' || partRegex.test(nextLine) || chapterRegex.test(nextLine) || nextLine === "About the Author") {
        isEndOfParagraph = true;
      } else if (line.length < 63) {
        if (nextLine.match(/^[a-z]/)) {
          isEndOfParagraph = false; // Next line starts with lowercase, likely continuation
        } else {
          isEndOfParagraph = true;
        }
      }

      if (isEndOfParagraph) {
        flushParagraph();
      }
    }
  }
}

flushParagraph();

fs.writeFileSync(outputPath, JSON.stringify(book, null, 2));
console.log('Book parsed and saved to public/book.json');
