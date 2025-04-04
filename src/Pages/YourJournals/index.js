import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./index.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import DynamicSnackbar from "../../components/DynamicSnackbar";
import Cookies from "js-cookie";
import bibleBooks from "../Bible/data";

import { convertMomentWithFormatWhole } from "../../utils/methods";

const Page = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchTimeout = useRef(null);
  const loadingRef = useRef(false);

  const account = useMemo(() => {
    try {
      return Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
    } catch {
      return null;
    }
  }, []);

  const userId = account?.id;

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialPage = useMemo(() => parseInt(queryParams.get("page")) || 1, [queryParams]);

  const [pageIndex, setPageIndex] = useState(initialPage);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const fetchJournals = useCallback(async (page) => {
    if (!userId || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const payload = { pageIndex: page, pageSize, userId };
      const res = await dispatch(wotgsocial.journal.getAllJournalsAction(payload));

      if (res.success) {
        setJournals(res.data.journals);
        setTotalPages(res.data.totalPages);
      } else {
        setSnackbar({
          open: true,
          message: res.msg || "❌ Failed to load journals.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [dispatch, userId, pageSize]);

  // Sync journals with pageIndex
  useEffect(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);

    fetchTimeout.current = setTimeout(() => {
      fetchJournals(pageIndex);
    }, 150); // Faster debounce

    return () => clearTimeout(fetchTimeout.current);
  }, [fetchJournals, pageIndex]);

  // Sync pageIndex with URL
  useEffect(() => {
    const urlPage = parseInt(queryParams.get("page")) || 1;
    if (urlPage !== pageIndex) {
      setPageIndex(urlPage);
    }
  }, [queryParams, pageIndex]);

  const handlePrevPage = () => {
    if (pageIndex > 1) {
      navigate(`/your-journals?page=${pageIndex - 1}`);
    }
  };

  const handleNextPage = () => {
    if (pageIndex < totalPages) {
      navigate(`/your-journals?page=${pageIndex + 1}`);
    }
  };

  const handleGoBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.journalWrapper}>
          <h2 className={styles.heading}>Your Journals</h2>

          <div className={styles.goBackWrapper}>
            <button onClick={handleGoBack} className={styles.goBackButton}>
              ← Go Back
            </button>
          </div>

          {journals.length === 0 ? (
            <p>No journals found.</p>
          ) : (
            <ul className={styles.journalList}>
              {journals.map((j) => {
                const bookData = bibleBooks.find((b) => b.id === j.book);
                const bookName = bookData?.name?.[j.language] || `Book ${j.book}`;

                return (
                  <li key={j.id} className={styles.journalItem}>
                    <Link
                      to={`/view-journal/${j.id}?page=${pageIndex}`}
                      className={styles.journalLink}
                    >
                      <strong>
                        {bookName} {j.chapter}:{j.verse} ({j.language?.toUpperCase()})
                      </strong>

                      <div className={styles.journalDate}>
                        <b>Date Saved:</b> {convertMomentWithFormatWhole(j.createdAt)}
                      </div>

                      <div className={styles.journalPreview}>
                        {`${j.question1 || ""} ${j.question2 || ""} ${j.question3 || ""}`.slice(0, 300)}...
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={pageIndex === 1}>Previous</button>
            <span>Page {pageIndex} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={pageIndex === totalPages}>Next</button>
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
