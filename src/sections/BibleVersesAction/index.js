import React, { useCallback, useState } from "react";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faNoteSticky,
  faCommentDots,
  faTrashAlt,
  faBook
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const highlightColors = ["#ffff99", "#ffd9e1", "#ccffcc", "#cce5ff", "#ffcccc"];

const BibleVersesAction = ({ verse, onClose, onHighlight, highlightedVerses  }) => {
  const [copied, setCopied] = useState(false);

  const handleColorSelect = useCallback(
    (color) => {
      const storageKey = `highlighted_${verse.book}_${verse.chapter}_${verse.language}`;
      const scrollKey = `${storageKey}_scrollTo`;

      const updated = JSON.parse(localStorage.getItem(storageKey) || "{}");
      updated[verse.verse] = color;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      localStorage.setItem(scrollKey, `verse-${verse.verse}`);

      onHighlight(verse.verse, color);
      onClose();
    },
    [verse, onHighlight, onClose]
  );

  const handleCopy = () => {
    const copyText = verse.text;

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => {
        console.error("❌ Copy failed:", err);
      });
  };

  const handleRemoveHighlight = () => {
    const storageKey = `highlighted_${verse.book}_${verse.chapter}_${verse.language}`;
    const updated = JSON.parse(localStorage.getItem(storageKey) || "{}");
    delete updated[verse.verse];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    localStorage.removeItem(`${storageKey}_scrollTo`);
    onHighlight(verse.verse, null);
    onClose();
  };  

  // const { book, chapter, verse: verseNum, language } = verse;

  return (
    <>
      <div className={styles.footerAction}>
        <div className={styles.actionHeader}>
          <strong>Actions</strong>
          <button onClick={onClose}>✕</button>
        </div>

        <div className={styles.actionOptions}>
          {highlightColors.map((color) => (
            <button
              key={color}
              className={styles.colorCircle}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
            />
          ))}

          <button
            className={styles.iconButton}
            onClick={handleRemoveHighlight}
            disabled={!highlightedVerses?.[verse.verse]}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
            Remove Highlight
          </button>

          <Link
            to={`/journal/${verse.book}/${verse.chapter}/${verse.verse}/${verse.language}`}
            state={{ verseText: verse.text, commentary: verse.commentary }} 
            className={styles.iconButton}
          >
            <FontAwesomeIcon icon={faNoteSticky} />
            Journal
          </Link>

          <Link
            to={`/your-journals/`}
            className={styles.iconButton}
          >
            <FontAwesomeIcon icon={faBook} />
            View Your Journals
          </Link>

          {verse.commentary ? (
            <Link
              to={`/commentary/${verse.book}/${verse.chapter}/${verse.verse}/${verse.language}`}
              state={{ commentary: verse.commentary }} 
              className={styles.iconButton}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              Commentary
            </Link>
          ) : (
            <button
              className={styles.iconButton}
              disabled
              title="No commentary available for this verse"
            >
              <FontAwesomeIcon icon={faCommentDots} />
              Commentary
            </button>
          )}

          <button className={styles.iconButton} onClick={handleCopy}>
            <FontAwesomeIcon icon={faCopy} />
            Copy
          </button>
        </div>
      </div>

      {copied && <div className={styles.toast}>Verse copied!</div>}
    </>
  );
};

export default React.memo(BibleVersesAction, (prev, next) => (
  prev.verse?.verse === next.verse?.verse &&
  prev.verse?.text === next.verse?.text &&
  prev.onClose === next.onClose &&
  prev.onHighlight === next.onHighlight
));
