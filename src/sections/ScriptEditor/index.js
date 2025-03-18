import React, { useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./index.module.css";

const Section = ({ scriptText, setScriptText, onNext }) => {
    const location = useLocation();

    // ✅ Memoize Query Parameters (Prevents re-renders)
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const page = useMemo(() => queryParams.get("page") || 1, [queryParams]);

    // ✅ Memoized onChange Handler (Prevents function re-creation)
    const handleScriptChange = useCallback((e) => {
        if (scriptText !== e.target.value) {
            setScriptText(e.target.value);
        }
    }, [scriptText, setScriptText]);

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Script Editor</h2>
            <textarea
                className={styles.textArea}
                value={scriptText}
                onChange={handleScriptChange} // ✅ Memoized Handler
                placeholder="Type your script here..."
            />
            <div className={styles.linksContainer}>
                {/* ✅ Back button preserves pagination state */}
                <Link to={`/blogs?page=${page}`} className={styles.nextButton}>
                    ⬅ Back to Blogs
                </Link>
                <button className={styles.nextButton} onClick={onNext} disabled={!scriptText.trim()}>
                    Next ➡
                </button>
            </div>
        </div>
    );
};

// ✅ Wrap with React.memo properly
export default React.memo(Section);
