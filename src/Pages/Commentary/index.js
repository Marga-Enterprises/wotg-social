import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import styles from "./index.module.css";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import LoadingSpinner from "../../components/LoadingSpinner";
import bibleBooks from "../../Pages/Bible/data";
import verseCounts from "../../Pages/Bible/verseCountMap";

const Page = () => {
  const { book, chapter, verse, language } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const numericBook = parseInt(book);
  const numericChapter = parseInt(chapter);
  const numericVerse = parseInt(verse);

  const [loading, setLoading] = useState(true);
  const [commentaryText, setCommentaryText] = useState("");

  const loadingRef = useRef(false);

  const currentBook = useMemo(() => bibleBooks.find(b => b.id === numericBook), [numericBook]);
  const currentBookIndex = useMemo(() => bibleBooks.findIndex(b => b.id === numericBook), [numericBook]);
  const totalChapters = currentBook?.chapters || 1;

  const selectedVerses = location.state?.verses || [];
  const hasMultiple = selectedVerses.length > 1;
  const selectedVerseNumbers = useMemo(() => selectedVerses.map(v => v.verse), [selectedVerses]);
  const currentSelectedIndex = hasMultiple ? selectedVerseNumbers.findIndex(v => v === numericVerse) : -1;

  useEffect(() => {
    const fetchCommentary = async () => {
      const payload = { book, chapter, verse, language };
      if (!loadingRef.current && book && chapter && verse) {
        loadingRef.current = true;
        setLoading(true);

        const res = await dispatch(wotgsocial.bible.getBibleVersesAction(payload));
        const commentary = res?.data?.commentary || "";

        setCommentaryText(commentary);
        setLoading(false);
        loadingRef.current = false;
      }
    };

    fetchCommentary();
  }, [book, chapter, verse, language, dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [verse]);

  const markdownMemo = useMemo(() => (
    <ReactMarkdown
      children={commentaryText}
      remarkPlugins={[remarkBreaks]}
      components={{
        p: ({ node, ...props }) => <p style={{ marginBottom: '1.5rem' }} {...props} />
      }}
    />
  ), [commentaryText]);

  const handleGoBack = useCallback(() => {
    navigate(`/bible?book=${numericBook}&chapter=${numericChapter}&language=${language}`);
  }, [navigate, numericBook, numericChapter, language]);

  const handleNext = useCallback(() => {
    if (hasMultiple) {
      const currentIndex = selectedVerseNumbers.findIndex(v => v === numericVerse);
      const nextVerseNum = selectedVerseNumbers[currentIndex + 1];
      if (typeof nextVerseNum !== "undefined") {
        navigate(`/commentary/${numericBook}/${numericChapter}/${nextVerseNum}/${language}`, {
          state: { verses: selectedVerses }
        });
        return;
      }
    }

    const currentChapterVerseCount = verseCounts[numericBook]?.[numericChapter] || 1;

    if (numericVerse < currentChapterVerseCount) {
      navigate(`/commentary/${numericBook}/${numericChapter}/${numericVerse + 1}/${language}`);
    } else if (numericChapter < totalChapters) {
      navigate(`/commentary/${numericBook}/${numericChapter + 1}/1/${language}`);
    } else if (currentBookIndex < bibleBooks.length - 1) {
      const nextBook = bibleBooks[currentBookIndex + 1];
      navigate(`/commentary/${nextBook.id}/1/1/${language}`);
    }
  }, [hasMultiple, selectedVerses, selectedVerseNumbers, numericBook, numericChapter, numericVerse, language, navigate, currentBookIndex, totalChapters]);

  const handlePrev = useCallback(() => {
    if (hasMultiple) {
      const currentIndex = selectedVerseNumbers.findIndex(v => v === numericVerse);
      const prevVerseNum = selectedVerseNumbers[currentIndex - 1];
      if (typeof prevVerseNum !== "undefined") {
        navigate(`/commentary/${numericBook}/${numericChapter}/${prevVerseNum}/${language}`, {
          state: { verses: selectedVerses }
        });
        return;
      }
    }

    if (numericVerse > 1) {
      navigate(`/commentary/${numericBook}/${numericChapter}/${numericVerse - 1}/${language}`);
    } else if (numericChapter > 1) {
      const lastVerseInPrevChapter = verseCounts[numericBook]?.[numericChapter - 1] || 1;
      navigate(`/commentary/${numericBook}/${numericChapter - 1}/${lastVerseInPrevChapter}/${language}`);
    } else if (currentBookIndex > 0) {
      const previousBook = bibleBooks[currentBookIndex - 1];
      const lastChapter = previousBook.chapters;
      const lastVerse = verseCounts[previousBook.id]?.[lastChapter] || 1;
      navigate(`/commentary/${previousBook.id}/${lastChapter}/${lastVerse}/${language}`);
    }
  }, [hasMultiple, selectedVerses, selectedVerseNumbers, numericBook, numericChapter, numericVerse, language, navigate, currentBookIndex]);

  const isPrevDisabled = hasMultiple
    ? currentSelectedIndex === 0
    : numericBook === 1 && numericChapter === 1 && numericVerse === 1;

  const isNextDisabled = hasMultiple
    ? currentSelectedIndex === selectedVerseNumbers.length - 1
    : false;

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.mainContainer}>
          <div className={styles.goBackWrapper}>
            <button onClick={handleGoBack} className={styles.goBackButton}>
              ← Back
            </button>
          </div>

          <div className={styles.content}>
            <h2>Commentary</h2>

            {commentaryText ? (
              <div className={styles.markdownWrapper}>
                {markdownMemo}
              </div>
            ) : (
              <p className={styles.empty}>No commentary available for this verse.</p>
            )}

            <div className={styles.navButtons}>
              <button
                onClick={handlePrev}
                className={styles.prevButton}
                disabled={isPrevDisabled}
              >
                ← Previous
              </button>

              <button
                onClick={handleNext}
                className={styles.nextButton}
                disabled={isNextDisabled}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
