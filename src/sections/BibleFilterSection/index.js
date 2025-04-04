import React, { useMemo, useState } from "react";
import styles from "./index.module.css";
import bibleBooks from "../../Pages/Bible/data";
import BookAndChapterSelectModal from "../../components/BookAndChapterSelectModal";
import BibleSettingsModal from "../../components/BibleSettingsModal";
import SearchverseModal from "../../components/SearchVerseModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const BibleFilterSection = ({
  book,
  chapter,
  language,
  onBookChange,
  onChapterChange,
  onLanguageChange,
  onStyleChange, 
  onSearchVerse,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // 🆕 For settings
  const [showSearchModal, setShowSearchModal] = useState(false); 
  const currentBook = useMemo(() => bibleBooks.find((b) => b.id === book), [book]);

  const handleLanguageChange = (language) => {
    localStorage.setItem('bible_language', language);
    onLanguageChange(language);
  };

  return (
    <div className={styles.filterSection}>
      <div className={styles.filterControlsRow}>
        <button className={styles.gearButton} onClick={() => setShowSearchModal(true)}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>

        <div>
          <button className={styles.selectorButton} onClick={() => setShowModal(true)}>
            {currentBook?.name[language] || currentBook.name.eng} {chapter}
          </button>

          {showModal && (
            <BookAndChapterSelectModal
              language={language}
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
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          <option value="eng">WEB</option>
          <option value="fil">PND</option>
        </select>

        {/* Gear Icon */}
        <button className={styles.gearButton} onClick={() => setShowSettings(true)}>
          <FontAwesomeIcon icon={faGear} />
        </button>

        {/* Bible Settings Modal */}
        {showSettings && (
          <BibleSettingsModal
            onClose={() => setShowSettings(false)}
            onApply={(style) => {
              onStyleChange(style); // send it to Page
              setShowSettings(false);
            }}
          />
        )}

        {showSearchModal && (
          <SearchverseModal
            onClose={() => setShowSearchModal(false)}
            onApply={({ bookId, chapter, verse }) => {
              onSearchVerse?.({ bookId, chapter, verse });
              setShowSearchModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(BibleFilterSection);
