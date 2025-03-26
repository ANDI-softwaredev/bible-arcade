
// RSV Bible data model
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

// Sample RSV Bible text (for demo purposes)
// In a real app, this would come from an API or a complete dataset
export const rsvBibleSample: Record<string, Record<number, BibleVerse[]>> = {
  "Genesis": {
    1: [
      { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heavens and the earth." },
      { book: "Genesis", chapter: 1, verse: 2, text: "The earth was without form and void, and darkness was upon the face of the deep; and the Spirit of God was moving over the face of the waters." },
      { book: "Genesis", chapter: 1, verse: 3, text: "And God said, \"Let there be light\"; and there was light." },
      // Additional verses would be included in a complete implementation
    ]
  },
  "John": {
    1: [
      { book: "John", chapter: 1, verse: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { book: "John", chapter: 1, verse: 2, text: "He was in the beginning with God;" },
      { book: "John", chapter: 1, verse: 3, text: "all things were made through him, and without him was not anything made that was made." },
      // Additional verses would be included in a complete implementation
    ],
    3: [
      { book: "John", chapter: 3, verse: 16, text: "For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
      { book: "John", chapter: 3, verse: 17, text: "For God sent the Son into the world, not to condemn the world, but that the world might be saved through him." },
      // Additional verses would be included in a complete implementation
    ]
  },
  "Romans": {
    3: [
      { book: "Romans", chapter: 3, verse: 23, text: "since all have sinned and fall short of the glory of God," },
      { book: "Romans", chapter: 3, verse: 24, text: "they are justified by his grace as a gift, through the redemption which is in Christ Jesus," },
      // Additional verses would be included in a complete implementation
    ]
  }
  // In a real application, this would include all books, chapters, and verses
};

// Function to get a specific chapter
export function getChapter(book: string, chapter: number): BibleChapter | undefined {
  if (!rsvBibleSample[book] || !rsvBibleSample[book][chapter]) {
    return undefined;
  }
  
  return {
    book,
    chapter,
    verses: rsvBibleSample[book][chapter]
  };
}

// Function to get a specific verse
export function getVerse(book: string, chapter: number, verse: number): BibleVerse | undefined {
  if (!rsvBibleSample[book] || !rsvBibleSample[book][chapter]) {
    return undefined;
  }
  
  return rsvBibleSample[book][chapter].find(v => v.verse === verse);
}

// Function to search the Bible by text
export function searchBible(query: string): BibleVerse[] {
  const results: BibleVerse[] = [];
  const lowerQuery = query.toLowerCase();
  
  Object.keys(rsvBibleSample).forEach(book => {
    Object.keys(rsvBibleSample[book]).forEach(chapterStr => {
      const chapter = parseInt(chapterStr);
      rsvBibleSample[book][chapter].forEach(verse => {
        if (verse.text.toLowerCase().includes(lowerQuery)) {
          results.push(verse);
        }
      });
    });
  });
  
  return results;
}

// In a real application, you would fetch this data from an API
// or include a much larger dataset that includes the complete Bible
