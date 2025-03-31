const bibleBooks = [
  {
    id: 1,
    name: {
      eng: "Genesis",
      fil: "Genesis"
    },
    chapters: 50
  },
  {
    id: 2,
    name: {
      eng: "Exodus",
      fil: "Exodo"
    },
    chapters: 40
  },
  {
    id: 3,
    name: {
      eng: "Leviticus",
      fil: "Levitico"
    },
    chapters: 27
  },
  {
    id: 4,
    name: {
      eng: "Numbers",
      fil: "Bilang"
    },
    chapters: 36
  },
  {
    id: 5,
    name: {
      eng: "Deuteronomy",
      fil: "Deuteronomio"
    },
    chapters: 34
  },
  {
    id: 6,
    name: {
      eng: "Joshua",
      fil: "Josue"
    },
    chapters: 24
  },
  {
    id: 7,
    name: {
      eng: "Judges",
      fil: "Hukom"
    },
    chapters: 21
  },
  {
    id: 8,
    name: {
      eng: "Ruth",
      fil: "Ruth"
    },
    chapters: 4
  },
  {
    id: 9,
    name: {
      eng: "1 Samuel",
      fil: "1 Samuel"
    },
    chapters: 31
  },
  {
    id: 10,
    name: {
      eng: "2 Samuel",
      fil: "2 Samuel"
    },
    chapters: 24
  },
  {
    id: 11,
    name: {
      eng: "1 Kings",
      fil: "1 Hari"
    },
    chapters: 22
  },
  {
    id: 12,
    name: {
      eng: "2 Kings",
      fil: "2 Hari"
    },
    chapters: 25
  },
  {
    id: 13,
    name: {
      eng: "1 Chronicles",
      fil: "1 Cronica"
    },
    chapters: 29
  },
  {
    id: 14,
    name: {
      eng: "2 Chronicles",
      fil: "2 Cronica"
    },
    chapters: 36
  },
  {
    id: 15,
    name: {
      eng: "Ezra",
      fil: "Ezra"
    },
    chapters: 10
  },
  {
    id: 16,
    name: {
      eng: "Nehemiah",
      fil: "Nehemias"
    },
    chapters: 13
  },
  {
    id: 17,
    name: {
      eng: "Esther",
      fil: "Esther"
    },
    chapters: 10
  },
  {
    id: 18,
    name: {
      eng: "Job",
      fil: "Job"
    },
    chapters: 42
  },
  {
    id: 19,
    name: {
      eng: "Psalms",
      fil: "Awit"
    },
    chapters: 150
  },
  {
    id: 20,
    name: {
      eng: "Proverbs",
      fil: "Kawikaan"
    },
    chapters: 31
  },
  {
    id: 21,
    name: {
      eng: "Ecclesiastes",
      fil: "Eclesiastes"
    },
    chapters: 12
  },
  {
    id: 22,
    name: {
      eng: "Song of Solomon",
      fil: "Awit ni Solomon"
    },
    chapters: 8
  },
  {
    id: 23,
    name: {
      eng: "Isaiah",
      fil: "Isaias"
    },
    chapters: 66
  },
  {
    id: 24,
    name: {
      eng: "Jeremiah",
      fil: "Jeremias"
    },
    chapters: 52
  },
  {
    id: 25,
    name: {
      eng: "Lamentations",
      fil: "Pagluksa"
    },
    chapters: 5
  },
  {
    id: 26,
    name: {
      eng: "Ezekiel",
      fil: "Ezekiel"
    },
    chapters: 48
  },
  {
    id: 27,
    name: {
      eng: "Daniel",
      fil: "Daniel"
    },
    chapters: 12
  },
  {
    id: 28,
    name: {
      eng: "Hosea",
      fil: "Oseas"
    },
    chapters: 14
  },
  {
    id: 29,
    name: {
      eng: "Joel",
      fil: "Joel"
    },
    chapters: 3
  },
  {
    id: 30,
    name: {
      eng: "Amos",
      fil: "Amos"
    },
    chapters: 9
  },
  {
    id: 31,
    name: {
      eng: "Obadiah",
      fil: "Abadias"
    },
    chapters: 1
  },
  {
    id: 32,
    name: {
      eng: "Jonah",
      fil: "Jonas"
    },
    chapters: 4
  },
  {
    id: 33,
    name: {
      eng: "Micah",
      fil: "Mikas"
    },
    chapters: 7
  },
  {
    id: 34,
    name: {
      eng: "Nahum",
      fil: "Nahum"
    },
    chapters: 3
  },
  {
    id: 35,
    name: {
      eng: "Habakkuk",
      fil: "Habakuk"
    },
    chapters: 3
  },
  {
    id: 36,
    name: {
      eng: "Zephaniah",
      fil: "Sofonias"
    },
    chapters: 3
  },
  {
    id: 37,
    name: {
      eng: "Haggai",
      fil: "Hagai"
    },
    chapters: 2
  },
  {
    id: 38,
    name: {
      eng: "Zechariah",
      fil: "Zacarias"
    },
    chapters: 14
  },
  {
    id: 39,
    name: {
      eng: "Malachi",
      fil: "Malakias"
    },
    chapters: 4
  },
  {
    id: 40,
    name: {
      eng: "Matthew",
      fil: "Mateo"
    },
    chapters: 28
  },
  {
    id: 41,
    name: {
      eng: "Mark",
      fil: "Marcos"
    },
    chapters: 16
  },
  {
    id: 42,
    name: {
      eng: "Luke",
      fil: "Lucas"
    },
    chapters: 24
  },
  {
    id: 43,
    name: {
      eng: "John",
      fil: "Juan"
    },
    chapters: 21
  },
  {
    id: 44,
    name: {
      eng: "Acts",
      fil: "Gawa"
    },
    chapters: 28
  },
  {
    id: 45,
    name: {
      eng: "Romans",
      fil: "Roma"
    },
    chapters: 16
  },
  {
    id: 46,
    name: {
      eng: "1 Corinthians",
      fil: "1 Corinto"
    },
    chapters: 16
  },
  {
    id: 47,
    name: {
      eng: "2 Corinthians",
      fil: "2 Corinto"
    },
    chapters: 13
  },
  {
    id: 48,
    name: {
      eng: "Galatians",
      fil: "Galacia"
    },
    chapters: 6
  },
  {
    id: 49,
    name: {
      eng: "Ephesians",
      fil: "Efeso"
    },
    chapters: 6
  },
  {
    id: 50,
    name: {
      eng: "Philippians",
      fil: "Filipos"
    },
    chapters: 4
  },
  {
    id: 51,
    name: {
      eng: "Colossians",
      fil: "Colosas"
    },
    chapters: 4
  },
  {
    id: 52,
    name: {
      eng: "1 Thessalonians",
      fil: "1 Tesalonica"
    },
    chapters: 5
  },
  {
    id: 53,
    name: {
      eng: "2 Thessalonians",
      fil: "2 Tesalonica"
    },
    chapters: 3
  },
  {
    id: 54,
    name: {
      eng: "1 Timothy",
      fil: "1 Timoteo"
    },
    chapters: 6
  },
  {
    id: 55,
    name: {
      eng: "2 Timothy",
      fil: "2 Timoteo"
    },
    chapters: 4
  },
  {
    id: 56,
    name: {
      eng: "Titus",
      fil: "Tito"
    },
    chapters: 3
  },
  {
    id: 57,
    name: {
      eng: "Philemon",
      fil: "Filemon"
    },
    chapters: 1
  },
  {
    id: 58,
    name: {
      eng: "Hebrews",
      fil: "Hebreo"
    },
    chapters: 13
  },
  {
    id: 59,
    name: {
      eng: "James",
      fil: "Santiago"
    },
    chapters: 5
  },
  {
    id: 60,
    name: {
      eng: "1 Peter",
      fil: "1 Pedro"
    },
    chapters: 5
  },
  {
    id: 61,
    name: {
      eng: "2 Peter",
      fil: "2 Pedro"
    },
    chapters: 3
  },
  {
    id: 62,
    name: {
      eng: "1 John",
      fil: "1 Juan"
    },
    chapters: 5
  },
  {
    id: 63,
    name: {
      eng: "2 John",
      fil: "2 Juan"
    },
    chapters: 1
  },
  {
    id: 64,
    name: {
      eng: "3 John",
      fil: "3 Juan"
    },
    chapters: 1
  },
  {
    id: 65,
    name: {
      eng: "Jude",
      fil: "Judas"
    },
    chapters: 1
  },
  {
    id: 66,
    name: {
      eng: "Revelation",
      fil: "Pahayag"
    },
    chapters: 22
  }
];

export default bibleBooks;
