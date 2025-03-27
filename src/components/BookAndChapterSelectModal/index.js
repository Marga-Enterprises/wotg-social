import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./index.module.css";
import bibleBooks from "../../Pages/Bible/data";

const BookAndChapterSelectModal = ({ onClose, onSelect }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entering, setEntering] = useState(true); // 👈 for animation

  useEffect(() => {
    const timer = setTimeout(() => setEntering(false), 300); // match CSS animation time
    return () => clearTimeout(timer);
  }, []);

  const bookList = useMemo(() => bibleBooks, []);
  const chapters = useMemo(() => (
    selectedBook ? Array.from({ length: selectedBook.chapters }, (_, i) => i + 1) : []
  ), [selectedBook]);

  const handleBookClick = useCallback((book) => {
    requestAnimationFrame(() => setSelectedBook(book));
  }, []);

  const handleChapterSelect = useCallback((chapterNum) => {
    if (isProcessing || !selectedBook) return;

    setIsProcessing(true);
    onSelect({ bookId: selectedBook.id, chapter: chapterNum });
    onClose();
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedBook, onSelect, onClose, isProcessing]);

  return (
    <div className={`${styles.modal} ${entering ? styles.modalEnter : ""}`}>
      <div className={styles.header}>
        <h3>{selectedBook ? "CHAPTER" : "BOOK"}</h3>
        <button onClick={onClose} className={styles.cancel}>CANCEL</button>
      </div>

      <div className={styles.content}>
        {!selectedBook ? (
          <div className={styles.bookList}>
            {bookList.map((book) => (
              <div
                key={book.id}
                className={styles.bookItem}
                onClick={() => handleBookClick(book)}
              >
                {book.name}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.chapterGrid}>
            {chapters.map((chapter) => (
              <div
                key={chapter}
                className={styles.chapterItem}
                onClick={() => handleChapterSelect(chapter)}
              >
                {chapter}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(BookAndChapterSelectModal);
