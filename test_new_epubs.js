const EPub = require('epub2').EPub;
const path = require('path');
const { parse } = require('node-html-parser');
const fs = require('fs');

async function validateBook(filename) {
  console.log(`\n========================================`);
  console.log(`VALIDATING: ${filename}`);
  console.log(`========================================`);
  
  const bookPath = path.join(process.cwd(), 'public', 'books', filename);
  if (!fs.existsSync(bookPath)) {
    console.log(`File not found: ${filename}`);
    return;
  }
  
  try {
    const epub = await EPub.createAsync(bookPath);
    console.log(`Title: ${epub.metadata.title}`);
    console.log(`Total flow elements (chapters/parts): ${epub.flow.length}`);
    
    // Print TOC
    console.log("\n--- TABLE OF CONTENTS ---");
    epub.flow.forEach((c, i) => {
      console.log(`${i}: ${c.title || 'Untitled'} (ID: ${c.id})`);
    });

    // Check content parsing
    console.log("\n--- PARSING VALIDATION ---");
    let totalNodes = 0;
    let emptyChapters = 0;
    
    for (let i = 0; i < epub.flow.length; i++) {
      const chapterId = epub.flow[i].id;
      const html = await epub.getChapterRawAsync(chapterId);
      const root = parse(html);
      const elements = root.querySelectorAll('p, h1, h2, h3, div');
      
      let contentNodes = [];
      let lastNode = null;

      elements.forEach((el) => {
        const textRaw = el.textContent?.trim();
        if (!textRaw || textRaw.length === 0) return;
        if (el.tagName.toLowerCase() === 'div' && el.querySelector('p')) return;

        const htmlContent = el.innerHTML || '';
        const cleanHtml = htmlContent.replace(/\s+/g, ' ').trim();
        
        if (lastNode && !lastNode.text.match(/[.?!…”"'](<\/[^>]+>)?$/)) {
          lastNode.text += ' ' + cleanHtml;
        } else {
          const newNode = { text: cleanHtml };
          contentNodes.push(newNode);
          lastNode = newNode;
        }
      });
      
      if (contentNodes.length === 0) {
        // Fallback check
        const body = root.querySelector('body');
        const bodyText = body ? body.textContent?.trim() : root.textContent?.trim();
        if (bodyText) {
          contentNodes = bodyText.split('\n').filter(t => t.trim().length > 0).map(t => ({text: t}));
        }
      }

      totalNodes += contentNodes.length;
      if (contentNodes.length === 0) emptyChapters++;
      
      // Print first 2 chapters to see what we're extracting
      if (i < 2) {
        console.log(`\nChapter ${i} extract (${contentNodes.length} nodes):`);
        for (let j = 0; j < Math.min(3, contentNodes.length); j++) {
          console.log(`  - ${contentNodes[j].text.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\nTotal text nodes extracted across book: ${totalNodes}`);
    console.log(`Empty chapters (likely just images/covers): ${emptyChapters}`);
    
  } catch (e) {
    console.error("Failed to parse", e);
  }
}

async function run() {
  await validateBook('The Kind Worth Killing - Peter Swanson.epub');
  await validateBook('vdoc.pub_the-day-of-the-jackal.epub');
  await validateBook('vdoc.pub_the-girl-with-the-dragon-tattoo.epub');
}

run();
