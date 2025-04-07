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
import { saveScrollPosition } from "../../utils/methods";

const highlightColors = ["#ffff99", "#ffd9e1", "#ccffcc", "#cce5ff", "#ffcccc"];

const BibleVersesAction = ({ verses = [], onClose, onHighlight, highlightedVerses }) => {
  const [copied, setCopied] = useState(false);
  const firstVerse = verses[0]; // Used for journal and commentary

  const handleColorSelect = useCallback(
    (color) => {
      const storageKey = `highlighted_${firstVerse.book}_${firstVerse.chapter}_${firstVerse.language}`;
      const scrollKey = `${storageKey}_scrollTo`;
      const updated = JSON.parse(localStorage.getItem(storageKey) || "{}");

      verses.forEach((v) => {
        updated[v.verse] = color;
        onHighlight(v.verse, color);
      });

      localStorage.setItem(storageKey, JSON.stringify(updated));
      localStorage.setItem(scrollKey, `verse-${firstVerse.verse}`);
      onClose();
    },
    [verses, firstVerse, onHighlight, onClose]
  );

  const handleRemoveHighlight = () => {
    const storageKey = `highlighted_${firstVerse.book}_${firstVerse.chapter}_${firstVerse.language}`;
    const updated = JSON.parse(localStorage.getItem(storageKey) || "{}");

    verses.forEach((v) => {
      delete updated[v.verse];
      onHighlight(v.verse, null);
    });

    localStorage.setItem(storageKey, JSON.stringify(updated));
    localStorage.removeItem(`${storageKey}_scrollTo`);
    onClose();
  };

  const handleCopy = () => {
    const copyText = verses.map((v) => v.text).join("\n");

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

  return (
    <>
      <div className={styles.footerAction}>
        <div className={styles.actionHeader}>
          <strong>Actions ({verses.length})</strong>
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
            disabled={verses.every((v) => !highlightedVerses?.[v.verse])}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
            Remove Highlight
          </button>

          <Link
            to={`/journal/${firstVerse.book}/${firstVerse.chapter}/${firstVerse.verse}/${firstVerse.language}`}
            className={styles.iconButton}
            onClick={saveScrollPosition}
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

          {firstVerse.commentary ? (
            <Link
              to={`/commentary/${firstVerse.book}/${firstVerse.chapter}/${firstVerse.verse}/${firstVerse.language}`}
              state={{ verses }}
              className={styles.iconButton}
              onClick={saveScrollPosition}
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
  prev.verses?.length === next.verses?.length &&
  prev.verses.every((v, i) => v.verse === next.verses[i]?.verse) &&
  prev.onClose === next.onClose &&
  prev.onHighlight === next.onHighlight
));
