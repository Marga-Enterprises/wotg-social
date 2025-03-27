import React, { useState, useEffect, useCallback } from "react";
import styles from "./index.module.css";

const LOCAL_KEY = "bible_style";

const BibleSettingsModal = ({ onApply, onClose }) => {
  const [fontSize, setFontSize] = useState("20px");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [fontColor, setFontColor] = useState("#000000");

  // 🧠 Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
        if (parsed.color) setFontColor(parsed.color);
      }
    } catch (e) {
      console.warn("Invalid local storage format for bible_style");
    }
  }, []);

  // ✅ Handlers
  const handleFontSizeChange = useCallback((e) => {
    setFontSize(`${e.target.value}px`);
  }, []);

  const handleFontFamilyChange = useCallback((e) => {
    setFontFamily(e.target.value);
  }, []);

  const handleFontColorChange = useCallback((e) => {
    setFontColor(e.target.value);
  }, []);

  const handleApply = useCallback(() => {
    const style = { fontSize, fontFamily, color: fontColor };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(style));
    onApply(style);
  }, [fontSize, fontFamily, fontColor, onApply]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>Bible Reader Settings</h3>

        <label>
          Font Size
          <input
            type="number"
            min="10"
            max="48"
            value={parseInt(fontSize)}
            onChange={handleFontSizeChange}
          />
        </label>

        <label>
          Font Family
          <select value={fontFamily} onChange={handleFontFamilyChange}>
            <option value="sans-serif">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </label>

        <label>
          Font Color
          <input type="color" value={fontColor} onChange={handleFontColorChange} />
        </label>

        <div className={styles.modalActions}>
          <button onClick={handleApply}>Apply</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BibleSettingsModal);
