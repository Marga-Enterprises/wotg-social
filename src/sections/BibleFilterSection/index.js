import React, { useMemo, useState } from "react";
import styles from "./index.module.css";
import bibleBooks from "../../Pages/Bible/data";
import BookAndChapterSelectModal from "../../components/BookAndChapterSelectModal";

const BibleFilterSection = ({
  book,
  chapter,
  language,
  onBookChange,
  onChapterChange,
  onLanguageChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const currentBook = useMemo(() => bibleBooks.find((b) => b.id === book), [book]);

  return (
    <div className={styles.filterSection}>
      <div className={styles.filterControlsRow}>
        <div>
          <button className={styles.selectorButton} onClick={() => setShowModal(true)}>
            {currentBook?.name} {chapter}
          </button>

          {showModal && (
            <BookAndChapterSelectModal
              onSelect={({ bookId, chapter }) => {
                onBookChange(bookId);
                onChapterChange(chapter);
                setShowModal(false);
              }}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>

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
