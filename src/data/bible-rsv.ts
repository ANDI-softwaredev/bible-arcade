
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
  },
  // Adding the requested books with their chapters
  "Hebrews": {
    1: [
      { book: "Hebrews", chapter: 1, verse: 1, text: "In many and various ways God spoke of old to our fathers by the prophets;" },
      { book: "Hebrews", chapter: 1, verse: 2, text: "but in these last days he has spoken to us by a Son, whom he appointed the heir of all things, through whom also he created the world." },
      // Additional verses would be included in a complete implementation
    ]
  },
  "Mark": {
    1: [
      { book: "Mark", chapter: 1, verse: 1, text: "The beginning of the gospel of Jesus Christ, the Son of God." },
      { book: "Mark", chapter: 1, verse: 2, text: "As it is written in Isaiah the prophet, \"Behold, I send my messenger before thy face, who shall prepare thy way;" },
      // Additional verses would be included in a complete implementation
    ]
  },
  "Ezra": {
    1: [
      { book: "Ezra", chapter: 1, verse: 1, text: "In the first year of Cyrus king of Persia, that the word of the LORD by the mouth of Jeremiah might be accomplished, the LORD stirred up the spirit of Cyrus king of Persia so that he made a proclamation throughout all his kingdom and also put it in writing:" },
      { book: "Ezra", chapter: 1, verse: 2, text: "\"Thus says Cyrus king of Persia: The LORD, the God of heaven, has given me all the kingdoms of the earth, and he has charged me to build him a house at Jerusalem, which is in Judah." },
      // Additional verses would be included in a complete implementation
    ]
  },
  "Numbers": {
    1: [
      { book: "Numbers", chapter: 1, verse: 1, text: "The LORD spoke to Moses in the wilderness of Sinai, in the tent of meeting, on the first day of the second month, in the second year after they had come out of the land of Egypt, saying," },
      { book: "Numbers", chapter: 1, verse: 2, text: "\"Take a census of all the congregation of the people of Israel, by families, by fathers' houses, according to the number of names, every male, head by head;" },
      // Additional verses would be included in a complete implementation
    ]
  }
  // In a real application, this would include all books, chapters, and verses
};

// Now let's create a function to get all chapters for a book
export function getAllChaptersForBook(book: string): number[] {
  const chapters: number[] = [];
  
  // Define the number of chapters for each book according to the request
  const chapterCounts: Record<string, number> = {
    "Genesis": 50,
    "John": 21,
    "Romans": 16,
    "Hebrews": 13,
    "Mark": 16,
    "Ezra": 10,
    "Numbers": 36
  };
  
  if (chapterCounts[book]) {
    for (let i = 1; i <= chapterCounts[book]; i++) {
      chapters.push(i);
    }
  }
  
  return chapters;
}

// Update the getChapter function to use our chapter counts
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
  const books = [
    { id: "GEN", name: "Genesis", testament: "OT" as const, chapters: getAllChaptersForBook("Genesis") },
    { id: "JHN", name: "John", testament: "NT" as const, chapters: getAllChaptersForBook("John") },
    { id: "ROM", name: "Romans", testament: "NT" as const, chapters: getAllChaptersForBook("Romans") },
    { id: "HEB", name: "Hebrews", testament: "NT" as const, chapters: getAllChaptersForBook("Hebrews") },
    { id: "MRK", name: "Mark", testament: "NT" as const, chapters: getAllChaptersForBook("Mark") },
    { id: "EZR", name: "Ezra", testament: "OT" as const, chapters: getAllChaptersForBook("Ezra") },
    { id: "NUM", name: "Numbers", testament: "OT" as const, chapters: getAllChaptersForBook("Numbers") }
  ];
  
  return books;
}

// In a real application, you would fetch this data from an API
// or include a much larger dataset that includes the complete Bible
