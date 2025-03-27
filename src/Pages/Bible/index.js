import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";
import wotgLogo from "./wotg-logo.webp";
import bibleBooks from "./data";
import { useLocation, useNavigate } from "react-router-dom";

// SECTIONS
import BibleFilterSection from "../../sections/BibleFilterSection";

const Page = () => {
    const dispatch = useDispatch();
    const loadingRef = useRef(false);
    const syncTimeout = useRef(null);
    const longPressTimer = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const [book, setBook] = useState(1);
    const [chapter, setChapter] = useState(1);
    const [language, setLanguage] = useState("eng");
    const [highlightedVerses, setHighlightedVerses] = useState({});
    const [copiedVerse, setCopiedVerse] = useState(null);
    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const bookName = useMemo(() => bibleBooks.find(b => b.id === book)?.name?.[language] || `Book ${book}`, [book, language]);
    const highlightKey = useMemo(() => `highlighted_${book}_${chapter}_${language}`, [book, chapter, language]);

    // ✅ Load initial state from URL params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const b = parseInt(params.get("book")) || 1;
        const c = parseInt(params.get("chapter")) || 1;
        const l = params.get("language") || "eng";

        setBook(b);
        setChapter(c);
        setLanguage(l);
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(highlightKey);
            setHighlightedVerses(stored ? JSON.parse(stored) : {});
        } catch {
            setHighlightedVerses({});
        }
    }, [highlightKey]);
      

    // ✅ Sync to URL on change
    useEffect(() => {
        if (syncTimeout.current) clearTimeout(syncTimeout.current);
        syncTimeout.current = setTimeout(() => {
            const params = new URLSearchParams();
            params.set("book", book);
            params.set("chapter", chapter);
            params.set("language", language);
            navigate({ search: params.toString() }, { replace: true });
        }, 300); // prevent rapid syncs
        return () => clearTimeout(syncTimeout.current);
    }, [book, chapter, language, navigate]);

    // ✅ Fetch verses with memoized callback
    const fetchVerses = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const payload = { book, chapter, language };
            const response = await dispatch(wotgsocial.bible.getAllBiblesAction(payload));

            if (response?.data?.verses?.length) {
                setVerses(response.data.verses);
            } else {
                setVerses([]);
                throw new Error("Invalid or empty response.");
            }
        } catch (err) {
            setError("⚠️ Failed to load verses.");
            console.error("Fetch error:", err);
        }

        setLoading(false);
    }, [dispatch, book, chapter, language]);

    useEffect(() => {
        loadingRef.current = false;
        fetchVerses();
    }, [fetchVerses]);

    const handleNext = useCallback(() => {
        const currentBook = bibleBooks.find(b => b.id === book);
        if (!currentBook) return;

        window.scrollTo({ top: 0, behavior: "auto" });

        if (chapter < currentBook.chapters) {
            setChapter(prev => prev + 1);
        } else if (book < 66) {
            setBook(prev => prev + 1);
            setChapter(1);
        }
    }, [book, chapter]);

    const handlePrev = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "auto" });

        if (chapter > 1) {
            setChapter(prev => prev - 1);
        } else if (book > 1) {
            const prevBook = bibleBooks.find(b => b.id === book - 1);
            if (prevBook) {
                setBook(prev => prev - 1);
                setChapter(prevBook.chapters);
            }
        }
    }, [book, chapter]);

    const handlePressStart = (verse, text) => {
        longPressTimer.current = setTimeout(() => {
          // ✅ Highlight
          const newHighlights = { ...highlightedVerses, [verse]: true };
          setHighlightedVerses(newHighlights);
          localStorage.setItem(`highlighted_${book}_${chapter}_${language}`, JSON.stringify(newHighlights));
      
          // ✅ Copy to clipboard
          navigator.clipboard.writeText(`${bookName} ${chapter}:${verse} — ${text}`);
      
          // ✅ Show message
          setCopiedVerse(verse);
          setTimeout(() => setCopiedVerse(null), 2000); // Reset after 2s
        }, 2000); // ⏱️ Changed from 600ms to 3000ms
    };
      
    const handlePressEnd = () => {
        clearTimeout(longPressTimer.current);
    };

    const isFirstChapter = book === 1 && chapter === 1;
    const isLastChapter = book === 66 && chapter === bibleBooks.find(b => b.id === 66)?.chapters;

    return (
        <div className={styles.mainContainer}>
            <div className={styles.navbar}>
                <div className={styles.logo}>
                    <img src={wotgLogo} alt="WOTG Logo" />
                </div>
                <div className={styles.navLinks}>
                    <a href="/" className={styles.navLink}>Chat</a>
                    <a href="/blogs" className={styles.navLink}>Devotion</a>
                    <a href="/worship" className={styles.navLink}>Worship</a>
                    <a
                        href="https://wotgonline.com/donate/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.navLink}
                    >
                        Give
                    </a>
                </div>
            </div>

            <BibleFilterSection
                book={book}
                chapter={chapter}
                language={language}
                onBookChange={setBook}
                onChapterChange={setChapter}
                onLanguageChange={setLanguage}
            />

            <div className={styles.bibleReader}>
                <h2 className={styles.bookTitle}>{bookName} - Chapter {chapter}</h2>

                <button
                    className={`${styles.navArrow} ${styles.leftArrow}`}
                    onClick={handlePrev}
                    disabled={isFirstChapter}
                >
                    &#8592;
                </button>

                <button
                    className={`${styles.navArrow} ${styles.rightArrow}`}
                    onClick={handleNext}
                    disabled={isLastChapter}
                >
                    &#8594;
                </button>

                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <div className={styles.verseContainer}>
                        {verses.map(({ verse, text }) => (
                            <p
                            key={verse}
                            className={`${styles.verseText} ${highlightedVerses[verse] ? styles.highlighted : ""}`}
                            onMouseDown={() => handlePressStart(verse, text)}
                            onTouchStart={() => handlePressStart(verse, text)}                            
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}
                            onTouchEnd={handlePressEnd}
                            >
                                <sup className={styles.verseNumber}>{verse}</sup> {text}
                            </p>
                        ))}
                    </div>
                )}

                {copiedVerse && (
                    <div className={styles.toast}>
                        Verse Copied to clipboard
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
