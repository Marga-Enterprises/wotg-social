import React, { useMemo } from "react";
import styles from "./index.module.css";
import bibleBooks from "../../Pages/Bible/data";

const BibleFilterSection = ({
  book,
  chapter,
  language,
  onBookChange,
  onChapterChange,
  onLanguageChange,
}) => {
  // ✅ Memoize current book and chapter count based on selected book
  const currentBook = useMemo(() => {
    return bibleBooks.find((b) => b.id === book);
  }, [book]);

  const chapterCount = useMemo(() => {
    return currentBook?.chapters || 1;
  }, [currentBook]);

  // ✅ Memoize chapters list (only recompute when chapter count changes)
  const chapterOptions = useMemo(() => {
    return Array.from({ length: chapterCount }, (_, i) => i + 1);
  }, [chapterCount]);

  return (
    <div className={styles.filterSection}>
      <div className={styles.filterControls}>
        {/* 📖 Book Selector */}
        <select
          className={styles.select}
          value={book}
          onChange={(e) => {
            const selected = Number(e.target.value);
            onBookChange(selected);
            onChapterChange(1); // Reset chapter when book changes
          }}
        >
          {bibleBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* 🔢 Chapter Selector */}
        <select
          className={styles.select}
          value={chapter}
          onChange={(e) => onChapterChange(Number(e.target.value))}
        >
          {chapterOptions.map((ch) => (
            <option key={ch} value={ch}>
              Chapter {ch}
            </option>
          ))}
        </select>

        {/* 🌍 Language Selector */}
        <select
          className={styles.select}
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          <option value="eng">English</option>
          <option value="fil">Filipino</option>
        </select>
      </div>
    </div>
  );
};

export default React.memo(BibleFilterSection);

