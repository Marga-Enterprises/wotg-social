import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const Page = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const loadingRef = useRef(false);

  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });

  const page = useMemo(
    () => new URLSearchParams(location.search).get("page") || 1,
    [location.search]
  );

  const markdownComponents = useMemo(() => ({
    p: ({ node, ...props }) => (
      <p style={{ marginBottom: "2rem", whiteSpace: "pre-wrap" }} {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong style={{ color: "#b10000" }} {...props} />
    ),
  }), []);

  const showToast = useCallback((message, duration = 2000) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), duration);
  }, []);

  const fetchJournalDetails = useCallback(async () => {
    if (!id || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(wotgsocial.journal.getJournalByIdAction(id));
      if (res.success) {
        setJournal((prev) => {
          const newData = res.data;
          return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
        });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchJournalDetails();
  }, [fetchJournalDetails]);

  const journalQuestions = useMemo(() => (
    journal ? [
      { title: "1. Ano ang sinabi ng Diyos?", content: journal.question1 },
      { title: "2. Ano ang aking pagkaintindi?", content: journal.question2 },
      { title: "3. Ano ang aking gagawin?", content: journal.question3 }
    ] : []
  ), [journal]);

  const handleCopyAll = useCallback(() => {
    if (!journal) return;

    const fullText = `1. Ano ang sinabi ng Diyos?\n${journal.question1 || ""}\n\n` +
                     `2. Ano ang aking pagkaintindi?\n${journal.question2 || ""}\n\n` +
                     `3. Ano ang aking gagawin?\n${journal.question3 || ""}`;

    navigator.clipboard.writeText(fullText).then(() => {
      showToast("Journal copied to clipboard!");
    });
  }, [journal, showToast]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this journal?")) return;

    setLoading(true);
    const res = await dispatch(wotgsocial.journal.deleteJournalAction({ id }));
    setLoading(false);

    if (res.success) {
      showToast("Journal deleted successfully!", 1500);
      setTimeout(() => {
        navigate(`/your-journals?page=${page}`);
      }, 1500);
    } else {
      showToast(res.msg || "❌ Failed to delete journal.");
    }
  }, [dispatch, id, navigate, page, showToast]);

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.mainContainer}>
          <div className={styles.journalContainer}>
            <div className={styles.copyAllWrapper}>
              <Link to={`/update-journal/${id}`}>
                <FontAwesomeIcon icon={faEdit} className={styles.iconButton} title="Edit" />
              </Link>
              <FontAwesomeIcon
                icon={faTrash}
                className={styles.iconButton}
                onClick={handleDelete}
                title="Delete"
              />
              <FontAwesomeIcon
                icon={faCopy}
                className={styles.iconButton}
                onClick={handleCopyAll}
                title="Copy All"
              />
            </div>

            {journalQuestions.map((q, index) => (
              <div key={index} className={styles.questionBlock}>
                <h2 className={styles.journalQuestion}>{q.title}</h2>
                <ReactMarkdown
                  children={q.content || ""}
                  remarkPlugins={[remarkBreaks]}
                  components={markdownComponents}
                />
              </div>
            ))}

            <center>
              <div className={styles.backButtonContainer}>
                <Link to={`/your-journals?page=${page}`} className={styles.backButton}>
                  ⬅ Back to Journals
                </Link>
              </div>
            </center>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={styles.toast}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default Page;
