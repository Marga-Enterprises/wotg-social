import React, { useCallback, useState } from "react";
import styles from "./index.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faNoteSticky, faCommentDots } from "@fortawesome/free-solid-svg-icons";

const highlightColors = ["#ffff99", "#ffd9e1", "#ccffcc", "#cce5ff", "#ffcccc"];

const BibleVersesAction = ({ verse, onClose, onHighlight }) => {
  const [copied, setCopied] = useState(false);

  const handleColorSelect = useCallback(
    (color) => {
      const storageKey = `highlighted_${verse.book}_${verse.chapter}_${verse.language}`;
      const scrollKey = `${storageKey}_scrollTo`;

      onHighlight(verse.verse, color);
      localStorage.setItem(scrollKey, `verse-${verse.verse}`);
      onClose();
    },
    [verse, onHighlight, onClose]
  );

  const handleCopy = () => {
    const copyText = verse.text;

    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch((err) => {
      console.error("❌ Copy failed:", err);
    });
  };

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

          <button className={styles.iconButton}>
            <FontAwesomeIcon icon={faCommentDots} />
            Commentary
          </button>

          <button className={styles.iconButton}>
            <FontAwesomeIcon icon={faNoteSticky} />
            Journal
          </button>

          <button className={styles.iconButton} onClick={handleCopy}>
            <FontAwesomeIcon icon={faCopy} />
            Copy
          </button>
        </div>
      </div>

      {copied && <div className={styles.toast}>📋 Verse copied!</div>}
    </>
  );
};

export default React.memo(BibleVersesAction, (prev, next) => (
  prev.verse?.verse === next.verse?.verse &&
  prev.verse?.text === next.verse?.text &&
  prev.onClose === next.onClose &&
  prev.onHighlight === next.onHighlight
));
