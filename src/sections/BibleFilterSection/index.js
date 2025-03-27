import React, { useMemo, useState } from "react";
import styles from "./index.module.css";
import bibleBooks from "../../Pages/Bible/data";
import BookAndChapterSelectModal from "../../components/BookAndChapterSelectModal";
import BibleSettingsModal from "../../components/BibleSettingsModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

const BibleFilterSection = ({
  book,
  chapter,
  language,
  onBookChange,
  onChapterChange,
  onLanguageChange,
  onStyleChange, 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // 🆕 For settings
  const currentBook = useMemo(() => bibleBooks.find((b) => b.id === book), [book]);

  return (
    <div className={styles.filterSection}>
      <div className={styles.filterControlsRow}>
        <div>
          <button className={styles.selectorButton} onClick={() => setShowModal(true)}>
            {currentBook?.name[language] || currentBook.name.eng} Chapter - {chapter}
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
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          <option value="eng">World English Bible - WEB</option>
          <option value="fil">Pagibig ng Diyos - PND</option>
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
      </div>
    </div>
  );
};

export default React.memo(BibleFilterSection);
