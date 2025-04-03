import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./index.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import DynamicSnackbar from "../../components/DynamicSnackbar";
import Cookies from "js-cookie";

import bibleBooks from "../Bible/data";

const Page = () => {
  const dispatch = useDispatch();
  const fetchTimeout = useRef(null);
  const loadingRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const account = useMemo(() => {
    try {
      return Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
    } catch {
      return null;
    }
  }, []);

  const userId = account?.id;

  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10); // Fixed size
  const [totalPages, setTotalPages] = useState(1);

  const fetchJournals = useCallback(async () => {
    if (!userId || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const payload = { pageIndex, pageSize, userId };
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

    setLoading(false);
    loadingRef.current = false;
  }, [dispatch, pageIndex, pageSize, userId]);

  useEffect(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => {
      fetchJournals();
    }, 250); // slight debounce for smoother UX

    return () => clearTimeout(fetchTimeout.current);
  }, [fetchJournals]);

  const handlePrevPage = () => pageIndex > 1 && setPageIndex((prev) => prev - 1);
  const handleNextPage = () => pageIndex < totalPages && setPageIndex((prev) => prev + 1);

  const handleGoBack = () => {
    if (location.key !== 'default') {
      navigate(-1); // Go back to previous page
    } else {
      navigate("/"); // Fallback if no history
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

            <div className={styles.viewAllWrapper}>
              <button
                className={styles.viewAllButton}
                onClick={() => navigate("/all-journals")}
              >
                View All Journals
              </button>
            </div>
          </div>

          {/* Journal List */}
          {journals.length === 0 ? (
            <p>No journals found.</p>
          ) : (
            <ul className={styles.journalList}>
              {journals.map((j) => {
                const bookData = bibleBooks.find((b) => b.id === j.book);
                const bookName = bookData?.name?.[j.language] || `Book ${j.book}`;

                return (
                  <li key={j.id} className={styles.journalItem}>
                    <strong>
                      {bookName} {j.chapter}:{j.verse} ({j.language?.toUpperCase()})
                    </strong>
                    <p>{j.content.slice(0, 200)}...</p>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Pagination */}
          <div className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={pageIndex === 1}>Previous</button>
            <span>Page {pageIndex} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={pageIndex === totalPages}>Next</button>
          </div>
        </div>
      )}

      {/* Snackbar */}
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
