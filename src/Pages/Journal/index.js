import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import styles from './index.module.css';
import DynamicSnackbar from "../../components/DynamicSnackbar";

import bibleBooks from "../Bible/data";

const Page = () => {
  const dispatch = useDispatch();
  const loadingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
  const [showCommentary, setShowCommentary] = useState(false);

  const { book, chapter, verse, language } = useParams();

  const bookData = bibleBooks.find(b => b.id === parseInt(book));
  const bookName = bookData?.name?.[language] || `Book ${book}`;


  // Form state
  const [pagkaintindi, setPagkaintindi] = useState("");
  const [gagawin, setGagawin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Simulate loading delay
  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loadingRef.current || submitting) return;
  
    const content =
      `1. Ano ang sinabi ng Diyos?
  ${verseText}
  
  2. Ano ang aking pagkaintindi?
  ${pagkaintindi}
  
  3. Ano ang aking ginawa?
  ${gagawin}`;
  
    const payload = {
      book,
      chapter,
      verse,
      content,
      language,
    };
  
    loadingRef.current = true;
    setSubmitting(true);
    setLoading(true);
  
    const res = await dispatch(wotgsocial.journal.createJournalAction(payload));
  
    loadingRef.current = false;
    setSubmitting(false);
    setLoading(false);
  
    if (res.success) {
      setSnackbar({
        open: true,
        message: "✅ Journal saved successfully!",
        type: "success",
      });
  
      // ⏳ Delay redirect by 2 seconds
      setTimeout(() => {
        navigate("/your-journals");
      }, 2000);
  
      // Clear form after successful submission
      setPagkaintindi("");
      setGagawin("");
    } else {
      setSnackbar({
        open: true,
        message: res.msg || "❌ Failed to save journal.",
        type: "error",
      });
    }
  }, [book, chapter, verse, pagkaintindi, gagawin, language, dispatch, navigate, submitting]);  

  const handleGoBack = () => {
    if (location.key !== 'default') {
      navigate(-1); // Go back to previous page
    } else {
      navigate("/"); // Fallback if no history
    }
  };

  const verseText = location.state?.verseText || "";
  const commentary = location.state?.commentary || "";

  return (
    <>
      {loading ? <LoadingSpinner /> : (
        <div className={styles.journalWrapper}>
          <div className={styles.goBackWrapper}>
            <button onClick={handleGoBack} className={styles.goBackButton}>
               ← Go Back
            </button>
          </div>

          <h2 className={styles.heading}>Conversation Time {bookName} {chapter}:{verse} ({language.toUpperCase()})</h2>

          <div className={styles.field}>
            <label htmlFor="sinabi">1. Ano ang sinabi ng Diyos?</label>
            <p className={styles.headingVerse}>"{verseText}"</p>

            {commentary && (
              <>
                <button
                  className={styles.commentaryToggle}
                  onClick={() => setShowCommentary((prev) => !prev)}
                >
                  <span className={styles.toggleIcon}>
                    {showCommentary ? "▲" : "▼"}
                  </span>
                  {showCommentary ? "Hide Commentary" : "Show Commentary"}
                </button>

                <div
                  className={`${styles.commentaryBox} ${
                    showCommentary ? styles.commentaryVisible : ""
                  }`}
                >
                  <p>{commentary}</p>
                </div>
              </>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="pagkaintindi">2. Ano ang aking pagkaintindi?</label>
            <textarea
              id="pagkaintindi"
              rows="4"
              value={pagkaintindi}
              onChange={(e) => setPagkaintindi(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="gagawin">3. Ano ang aking ginawa?</label>
            <textarea
              id="gagawin"
              rows="4"
              value={gagawin}
              onChange={(e) => setGagawin(e.target.value)}
            />
          </div>

          <div className={styles.submitWrapper}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={styles.submitButton}
            >
              {submitting ? "Saving..." : "Submit Journal"}
            </button>
          </div>
        </div>
      )}

      <DynamicSnackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
};

export default Page;
