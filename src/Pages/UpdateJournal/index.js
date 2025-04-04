import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import DynamicSnackbar from "../../components/DynamicSnackbar";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

import styles from "./index.module.css";

const Page = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
  const [showCommentary, setShowCommentary] = useState(false);

  const [question1, setQuestion1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [question3, setQuestion3] = useState("");

  const [initialData, setInitialData] = useState(null);
  const draftKey = useMemo(() => `journal-draft-${id}`, [id]);
  const commentary = location.state?.commentary || "";
  const saveInterval = useRef(null);

  const autosaveDraft = useCallback(() => {
    const draft = { question1, question2, question3 };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [question1, question2, question3, draftKey]);

  const fetchJournal = useCallback(async () => {
    setLoading(true);
    const res = await dispatch(wotgsocial.journal.getJournalByIdAction(id));
    if (res.success) {
      const saved = res.data;
      const draft = JSON.parse(localStorage.getItem(draftKey)) || {};
      setInitialData(saved);
      setQuestion1(draft.question1 || saved.question1 || "");
      setQuestion2(draft.question2 || saved.question2 || "");
      setQuestion3(draft.question3 || saved.question3 || "");
    } else {
      setSnackbar({ open: true, message: res.msg || "❌ Failed to load journal.", type: "error" });
    }
    setLoading(false);
  }, [dispatch, id, draftKey]);

  useEffect(() => {
    fetchJournal();
  }, [fetchJournal]);

  useEffect(() => {
    saveInterval.current = setInterval(autosaveDraft, 2000);
    return () => clearInterval(saveInterval.current);
  }, [autosaveDraft]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    setSubmitting(true);
    setLoading(true);
    const payload = { id, question1, question2, question3 };
    const res = await dispatch(wotgsocial.journal.updateJournalAction(payload));

    setSubmitting(false);
    setLoading(false);

    if (res.success) {
      localStorage.removeItem(draftKey);
      setSnackbar({ open: true, message: "Journal updated successfully!", type: "success" });
      setTimeout(() => navigate("/your-journals"), 2000);
    } else {
      setSnackbar({ open: true, message: res.msg || "❌ Failed to update journal.", type: "error" });
    }
  }, [dispatch, id, question1, question2, question3, submitting, draftKey, navigate]);

  const handleDiscard = useCallback(() => {
    localStorage.removeItem(draftKey);
    setQuestion1(initialData?.question1 || "");
    setQuestion2(initialData?.question2 || "");
    setQuestion3(initialData?.question3 || "");
    setInitialData((prev) => ({ ...prev }));
    setSnackbar({ open: true, message: "🗑 Draft discarded.", type: "info" });
  }, [initialData, draftKey]);

  const isDiscardDisabled = useMemo(() => {
    const draftRaw = localStorage.getItem(draftKey);
    if (!draftRaw || !initialData) return true;
    try {
      const draft = JSON.parse(draftRaw);
      return (
        draft.question1 === initialData.question1 &&
        draft.question2 === initialData.question2 &&
        draft.question3 === initialData.question3
      );
    } catch {
      return true;
    }
  }, [initialData, draftKey]);

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.journalWrapper}>
          <h2 className={styles.heading}>Update Journal</h2>

          <div className={styles.field}>
            <label>1. Ano ang sinabi ng Diyos?</label>
            <p className={styles.headingVerse}>"{question1}"</p>

            {commentary && (
              <>
                <button
                  className={styles.commentaryToggle}
                  onClick={() => setShowCommentary((prev) => !prev)}
                >
                  <span className={styles.toggleIcon}>{showCommentary ? "▲" : "▼"}</span>
                  {showCommentary ? "Hide Commentary" : "Show Commentary"}
                </button>

                <div className={`${styles.commentaryBox} ${showCommentary ? styles.commentaryVisible : ""}`}>
                  <ReactMarkdown
                    children={commentary}
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p style={{ marginBottom: "1.5rem" }} {...props} />
                      ),
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
              {submitting ? "Saving..." : "Update"}
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
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default Page;
