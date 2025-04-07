import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import DynamicSnackbar from "../../components/DynamicSnackbar";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import bibleBooks from "../Bible/data";

import styles from "./index.module.css";

const Page = () => {
  const dispatch = useDispatch();
  const loadingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { book, chapter, verse, language } = useParams();
  const bookData = useMemo(() => bibleBooks.find(b => b.id === parseInt(book)), [book]);
  const bookName = bookData?.name?.[language] || `Book ${book}`;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCommentary, setShowCommentary] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const [commentary, setCommentary] = useState("");
  const [verseText, setVerseText] = useState("");
  const [question2, setQuestion2] = useState("");
  const [question3, setQuestion3] = useState("");

  const draftKey = useMemo(() => `journal-draft-${book}-${chapter}-${verse}-${language}`, [book, chapter, verse, language]);
  const saveInterval = useRef(null);

  // ✅ Load draft and fetch verse + commentary
  useEffect(() => {
    const loadData = async () => {
      const payload = { book, chapter, verse, language };

      const draft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      if (draft.question2) setQuestion2(draft.question2);
      if (draft.question3) setQuestion3(draft.question3);

      if (!loadingRef.current) {
        loadingRef.current = true;

        const res = await dispatch(wotgsocial.bible.getBibleVersesAction(payload));
        const fetchedCommentary = res?.data?.commentary || "";
        const fetchedVerseText = res?.data?.text || "";

        setCommentary(fetchedCommentary);
        setVerseText(fetchedVerseText);

        loadingRef.current = false;
        setLoading(false);
      }
    };

    loadData();
  }, [book, chapter, verse, language, dispatch, draftKey]);

  // ✅ Autosave every 2s
  useEffect(() => {
    saveInterval.current = setInterval(() => {
      localStorage.setItem(draftKey, JSON.stringify({ question2, question3 }));
    }, 2000);

    return () => clearInterval(saveInterval.current);
  }, [question2, question3, draftKey]);

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
      localStorage.removeItem(draftKey);
      setSnackbar({ open: true, message: "Journal saved successfully!", type: "success" });
      setTimeout(() => navigate("/your-journals"), 2000);
    } else {
      setSnackbar({ open: true, message: res.msg || "❌ Failed to save journal.", type: "error" });
    }
  }, [book, chapter, verse, language, verseText, question2, question3, dispatch, navigate, submitting, draftKey]);

  const handleDiscard = () => {
    localStorage.removeItem(draftKey);
    setQuestion2("");
    setQuestion3("");
    setSnackbar({ open: true, message: "🗑 Draft discarded.", type: "info" });
  };

  const isDiscardDisabled = useMemo(() => {
    const draftRaw = localStorage.getItem(draftKey);
    if (!draftRaw) return true;

    try {
      const draft = JSON.parse(draftRaw);
      return !draft.question2 && !draft.question3;
    } catch {
      return true;
    }
  }, [draftKey]);

  const handleGoBack = useCallback(() => {
    if (location.key !== 'default') navigate(-1);
    else navigate("/");
  }, [navigate, location.key]);

  const markdownMemo = useMemo(() => (
    <ReactMarkdown
      children={commentary}
      remarkPlugins={[remarkBreaks]}
      components={{
        p: ({ node, ...props }) => <p style={{ marginBottom: '1.5rem' }} {...props} />
      }}
    />
  ), [commentary]);

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.journalWrapper}>
          <div className={styles.goBackWrapper}>
            <button onClick={handleGoBack} className={styles.goBackButton}>← Go Back</button>
          </div>

          <h2 className={styles.heading}>Conversation Time {bookName} {chapter}:{verse} ({language.toUpperCase()})</h2>

          <div className={styles.field}>
            <label>1. Ano ang sinabi ng Diyos?</label>
            <p className={styles.headingVerse}>"{verseText}"</p>

            {commentary && (
              <>
                <button
                  className={styles.commentaryToggle}
                  onClick={() => setShowCommentary(prev => !prev)}
                >
                  <span className={styles.toggleIcon}>{showCommentary ? "▲" : "▼"}</span>
                  {showCommentary ? "Hide Commentary" : "Show Commentary"}
                </button>

                <div className={`${styles.commentaryBox} ${showCommentary ? styles.commentaryVisible : ""}`}>
                  {markdownMemo}
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
              {submitting ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handleDiscard}
              disabled={isDiscardDisabled}
              className={styles.discardButton}
              title={isDiscardDisabled ? "No unsaved draft to discard" : "Discard current draft"}
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      <DynamicSnackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default Page;
