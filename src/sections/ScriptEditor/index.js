import React from 'react';
import styles from './index.module.css';

const Section = ({ scriptText, setScriptText, onNext }) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Script Editor</h2>
            <textarea
                className={styles.textArea}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Type your script here..."
            />
            <button className={styles.nextButton} onClick={onNext} disabled={!scriptText.trim()}>
                Next ➡
            </button>
        </div>
    );
};

export default Section;
