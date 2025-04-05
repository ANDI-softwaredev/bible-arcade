
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

// Expanded sample RSV Bible text (for demo purposes)
// In a real app, this would come from an API or a complete dataset
export const rsvBibleSample: Record<string, Record<number, BibleVerse[]>> = {
  "Genesis": {
    1: [
      { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heavens and the earth." },
      { book: "Genesis", chapter: 1, verse: 2, text: "The earth was without form and void, and darkness was upon the face of the deep; and the Spirit of God was moving over the face of the waters." },
      { book: "Genesis", chapter: 1, verse: 3, text: "And God said, \"Let there be light\"; and there was light." },
      { book: "Genesis", chapter: 1, verse: 4, text: "And God saw that the light was good; and God separated the light from the darkness." },
      { book: "Genesis", chapter: 1, verse: 5, text: "God called the light Day, and the darkness he called Night. And there was evening and there was morning, one day." }
    ],
    2: [
      { book: "Genesis", chapter: 2, verse: 1, text: "Thus the heavens and the earth were finished, and all the host of them." },
      { book: "Genesis", chapter: 2, verse: 2, text: "And on the seventh day God finished his work which he had done, and he rested on the seventh day from all his work which he had done." },
      { book: "Genesis", chapter: 2, verse: 3, text: "So God blessed the seventh day and hallowed it, because on it God rested from all his work which he had done in creation." }
    ]
  },
  "John": {
    1: [
      { book: "John", chapter: 1, verse: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { book: "John", chapter: 1, verse: 2, text: "He was in the beginning with God;" },
      { book: "John", chapter: 1, verse: 3, text: "all things were made through him, and without him was not anything made that was made." },
      { book: "John", chapter: 1, verse: 4, text: "In him was life, and the life was the light of men." },
      { book: "John", chapter: 1, verse: 5, text: "The light shines in the darkness, and the darkness has not overcome it." }
    ],
    3: [
      { book: "John", chapter: 3, verse: 16, text: "For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
      { book: "John", chapter: 3, verse: 17, text: "For God sent the Son into the world, not to condemn the world, but that the world might be saved through him." },
      { book: "John", chapter: 3, verse: 18, text: "He who believes in him is not condemned; he who does not believe is condemned already, because he has not believed in the name of the only Son of God." }
    ]
  },
  "Romans": {
    3: [
      { book: "Romans", chapter: 3, verse: 23, text: "since all have sinned and fall short of the glory of God," },
      { book: "Romans", chapter: 3, verse: 24, text: "they are justified by his grace as a gift, through the redemption which is in Christ Jesus," },
      { book: "Romans", chapter: 3, verse: 25, text: "whom God put forward as an expiation by his blood, to be received by faith. This was to show God's righteousness, because in his divine forbearance he had passed over former sins;" }
    ],
    8: [
      { book: "Romans", chapter: 8, verse: 28, text: "We know that in everything God works for good with those who love him, who are called according to his purpose." },
      { book: "Romans", chapter: 8, verse: 29, text: "For those whom he foreknew he also predestined to be conformed to the image of his Son, in order that he might be the first-born among many brethren." },
      { book: "Romans", chapter: 8, verse: 30, text: "And those whom he predestined he also called; and those whom he called he also justified; and those whom he justified he also glorified." }
    ]
  },
  "Psalms": {
    23: [
      { book: "Psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd, I shall not want;" },
      { book: "Psalms", chapter: 23, verse: 2, text: "he makes me lie down in green pastures. He leads me beside still waters;" },
      { book: "Psalms", chapter: 23, verse: 3, text: "he restores my soul. He leads me in paths of righteousness for his name's sake." }
    ]
  }
};

// Define the chapter counts for each book according to the standard Bible
const CHAPTER_COUNTS: Record<string, number> = {
  "Genesis": 50,
  "Exodus": 40,
  "Leviticus": 27,
  "Numbers": 36,
  "Deuteronomy": 34,
  "Joshua": 24,
  "Judges": 21,
  "Ruth": 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Kings": 22,
  "2 Kings": 25,
  "1 Chronicles": 29,
  "2 Chronicles": 36,
  "Ezra": 10,
  "Nehemiah": 13,
  "Esther": 10,
  "Job": 42,
  "Psalms": 150,
  "Proverbs": 31,
  "Ecclesiastes": 12,
  "Song of Solomon": 8,
  "Isaiah": 66,
  "Jeremiah": 52,
  "Lamentations": 5,
  "Ezekiel": 48,
  "Daniel": 12,
  "Hosea": 14,
  "Joel": 3,
  "Amos": 9,
  "Obadiah": 1,
  "Jonah": 4,
  "Micah": 7,
  "Nahum": 3,
  "Habakkuk": 3,
  "Zephaniah": 3,
  "Haggai": 2,
  "Zechariah": 14,
  "Malachi": 4,
  "Matthew": 28,
  "Mark": 16,
  "Luke": 24,
  "John": 21,
  "Acts": 28,
  "Romans": 16,
  "1 Corinthians": 16,
  "2 Corinthians": 13,
  "Galatians": 6,
  "Ephesians": 6,
  "Philippians": 4,
  "Colossians": 4,
  "1 Thessalonians": 5,
  "2 Thessalonians": 3,
  "1 Timothy": 6,
  "2 Timothy": 4,
  "Titus": 3,
  "Philemon": 1,
  "Hebrews": 13,
  "James": 5,
  "1 Peter": 5,
  "2 Peter": 3,
  "1 John": 5,
  "2 John": 1,
  "3 John": 1,
  "Jude": 1,
  "Revelation": 22
};

// Function to get all chapters for a book
export function getAllChaptersForBook(book: string): number[] {
  const chapters: number[] = [];
  
  if (CHAPTER_COUNTS[book]) {
    for (let i = 1; i <= CHAPTER_COUNTS[book]; i++) {
      chapters.push(i);
    }
  }
  
  return chapters;
}

// Get chapter
export function getChapter(book: string, chapter: number): BibleChapter | undefined {
  // If the chapter doesn't exist in our sample data, create a placeholder
  if (!rsvBibleSample[book] || !rsvBibleSample[book][chapter]) {
    const allChapters = getAllChaptersForBook(book);
    if (allChapters.includes(chapter)) {
      // Return a placeholder chapter with empty verses array
      return {
        book,
        chapter,
        verses: []
      };
    }
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

// Get all Bible books with their chapter counts
export function getAllBibleBooks(): { id: string; name: string; chapters: number[]; testament: 'OT' | 'NT' }[] {
  const books = Object.keys(CHAPTER_COUNTS).map(bookName => {
    // Determine testament based on book name
    const isOT = [
      "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", 
      "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", 
      "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", 
      "Ezra", "Nehemiah", "Esther", "Job", "Psalms", 
      "Proverbs", "Ecclesiastes", "Song of Solomon", 
      "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", 
      "Daniel", "Hosea", "Joel", "Amos", "Obadiah", 
      "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", 
      "Haggai", "Zechariah", "Malachi"
    ].includes(bookName);
    
    // Generate a simple ID
    const id = bookName.replace(/\s+/g, '').replace(/\d+/g, '').toUpperCase();
    
    return {
      id,
      name: bookName,
      testament: isOT ? 'OT' as const : 'NT' as const,
      chapters: getAllChaptersForBook(bookName)
    };
  });
  
  return books;
}
