import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, useLocation, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

const Page = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const loadingRef = useRef(false);

  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const page = useMemo(() => new URLSearchParams(location.search).get("page") || 1, [location.search]);

  const markdownComponents = {
    p: ({ node, ...props }) => (
      <p style={{ marginBottom: "2rem", whiteSpace: "pre-wrap" }} {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong style={{ color: "#b10000" }} {...props} />
    )
  };

  const fetchJournalDetails = useCallback(async () => {
    if (!id || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(wotgsocial.journal.getJournalByIdAction(id));
      if (res.success) {
        setJournal((prev) =>
          JSON.stringify(prev) !== JSON.stringify(res.data) ? res.data : prev
        );
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [dispatch, id]);

  useEffect(() => {
    fetchJournalDetails();
  }, [fetchJournalDetails]);

  const journalQuestions = useMemo(() => [
    { title: "1. Ano ang sinabi ng Diyos?", content: journal?.question1 },
    { title: "2. Ano ang aking pagkaintindi?", content: journal?.question2 },
    { title: "3. Ano ang aking ginawa?", content: journal?.question3 }
  ], [journal]);

  const handleCopyAll = () => {
    if (!journal) return;

    const fullText = `1. Ano ang sinabi ng Diyos?\n${journal.question1 || ""}\n\n` +
                     `2. Ano ang aking pagkaintindi?\n${journal.question2 || ""}\n\n` +
                     `3. Ano ang aking ginawa?\n${journal.question3 || ""}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setToastMessage("Journal copied to clipboard!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.mainContainer}>
          <div className={styles.journalContainer}>
            <div className={styles.copyAllWrapper}>
              <FontAwesomeIcon onClick={handleCopyAll} icon={faCopy} className={styles.copyButton} />
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

      {showToast && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default Page;
