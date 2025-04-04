import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import styles from './index.module.css';
import DynamicSnackbar from "../../components/DynamicSnackbar";
import bibleBooks from "../Bible/data";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

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

  const verseText = location.state?.verseText || "";
  const commentary = location.state?.commentary || "";

  // Form state (renamed to match backend fields)
  const [question2, setQuestion2] = useState("");
  const [question3, setQuestion3] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loadingRef.current || submitting) return;

    const payload = {
      book,
      chapter,
      verse,
      language,
      question1: verseText,
      question2,
      question3
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
        type: "success"
      });

      setTimeout(() => {
        navigate("/your-journals");
      }, 2000);

      // Clear form
      setQuestion2("");
      setQuestion3("");
    } else {
      setSnackbar({
        open: true,
        message: res.msg || "❌ Failed to save journal.",
        type: "error"
      });
    }
  }, [book, chapter, verse, language, question2, question3, verseText, dispatch, navigate, submitting]);

  const handleGoBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

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
            <label>1. Ano ang sinabi ng Diyos?</label>
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

                <div className={`${styles.commentaryBox} ${showCommentary ? styles.commentaryVisible : ""}`}>
                  <ReactMarkdown
                    children={commentary}
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      p: ({ node, ...props }) => <p style={{ marginBottom: '1.5rem' }} {...props} />
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="question2">2. Ano ang aking pagkaintindi?</label>
            <textarea
              id="question2"
              rows="4"
              value={question2}
              onChange={(e) => setQuestion2(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="question3">3. Ano ang aking gagawin?</label>
            <textarea
              id="question3"
              rows="4"
              value={question3}
              onChange={(e) => setQuestion3(e.target.value)}
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
