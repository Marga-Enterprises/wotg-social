import React, { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import styles from "./index.module.css";
import bibleBooks from "../../Pages/Bible/data";

const BookAndChapterSelectModal = ({ onClose, onSelect, language }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entering, setEntering] = useState(true);
  const [searchInput, setSearchInput] = useState("");   // 🔤 What user types
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ Debounced value

  const [, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
    }, 300); // debounce delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => setEntering(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const bookList = useMemo(() => bibleBooks, []);

  const filteredBooks = useMemo(() => {
    if (!debouncedSearch) return bookList;
    return bookList.filter((book) =>
      book.name?.[language]?.toLowerCase().includes(debouncedSearch)
    );
  }, [bookList, debouncedSearch, language]);

  const chapters = useMemo(() => (
    selectedBook ? Array.from({ length: selectedBook.chapters }, (_, i) => i + 1) : []
  ), [selectedBook]);

  const handleBookClick = useCallback((book) => {
    startTransition(() => {
      setSelectedBook(book);
      setSearchInput("");
      setDebouncedSearch("");
    });
  }, []);

  const handleChapterSelect = useCallback((chapterNum) => {
    if (!selectedBook || isProcessing) return;
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
          <>
            <input
              type="text"
              placeholder="Search Books..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.bookList}>
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className={styles.bookItem}
                  onClick={() => handleBookClick(book)}
                >
                  {book.name?.[language] || book.name.eng}
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <div className={styles.noResults}>No books found.</div>
              )}
            </div>
          </>
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
