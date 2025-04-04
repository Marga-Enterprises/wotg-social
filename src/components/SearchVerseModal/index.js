import React, { useState, useCallback } from "react";
import styles from "./index.module.css";
import bibleBooks from "../../Pages/Bible/data";

const SearchVerseModal = ({ onApply, onClose }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const parseReference = useCallback((raw) => {
    const cleaned = raw.trim().toLowerCase().replace(/\s+/g, " ");
    const match = cleaned.match(/^([a-z\s]+)\s+(\d+)(?::(\d+))?/);

    if (!match) return null;

    const bookName = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = match[3] ? parseInt(match[3]) : null;

    const bookEntry = bibleBooks.find((b) => {
      const name = b.name.eng.toLowerCase(); // You can localize this if needed
      return name === bookName || name.includes(bookName);
    });

    if (!bookEntry) return null;

    return {
      bookId: bookEntry.id,
      chapter,
      verse,
    };
  }, []);

  const handleSearch = useCallback(() => {
    const result = parseReference(input);

    if (!result) {
      setError("Invalid reference. Try 'John 3:16' or 'Genesis 1'.");
      return;
    }

    onApply(result);
    onClose();
  }, [input, onApply, onClose, parseReference]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <p className={styles.instruction}>
          Type a verse reference like <strong>John 3:16</strong> or a chapter like{" "}
          <strong>Genesis 1</strong>.
        </p>
        <input
          type="text"
          placeholder="e.g. Genesis 1:1 or John chapter 3"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          className={styles.searchInput}
          autoFocus
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.modalActions}>
          <button onClick={handleSearch}>Search</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SearchVerseModal);
