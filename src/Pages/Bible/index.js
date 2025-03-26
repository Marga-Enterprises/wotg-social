import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";
import wotgLogo from "./wotg-logo.webp";
import bibleBooks from "./data";

// SECTIONS
import BibleFilterSection from "../../sections/BibleFilterSection";

const Page = () => {
    const dispatch = useDispatch();
    const loadingRef = useRef(false);

    const [book, setBook] = useState(1);
    const [chapter, setChapter] = useState(1);
    const [language, setLanguage] = useState("eng");

    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const bookName = bibleBooks.find(b => b.id === book)?.name || `Book ${book}`;

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
        loadingRef.current = false; // 🔁 Reset loading ref so fetch runs
        fetchVerses();
    }, [fetchVerses]);

    // ✅ Handle next chapter or next book
    const handleNext = useCallback(() => {
        const currentBook = bibleBooks.find(b => b.id === book);
        if (!currentBook) return;
    
        window.scrollTo({ top: 0, behavior: "auto" }); // ✅ scroll to top
    
        if (chapter < currentBook.chapters) {
            setChapter(prev => prev + 1);
        } else if (book < 66) {
            setBook(prev => prev + 1);
            setChapter(1);
        }
    }, [book, chapter]);
    
    const handlePrev = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "auto" }); // ✅ scroll to top
    
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
    

    const isFirstChapter = book === 1 && chapter === 1;
    const isLastChapter =
        book === 66 && chapter === bibleBooks.find(b => b.id === 66)?.chapters;

    return (
        <div className={styles.mainContainer}>
            <div className={styles.navbar}>
            <div className={styles.logo}>
                <img src={wotgLogo} alt="WOTG Logo" />
            </div>
            <div className={styles.navLinks}>
                <a href="/" className={styles.navLink}>Chat</a>
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
        
            <div className={styles.bibleReader}>
            {/* ✅ Reusable Bible Filter Section */}
            <BibleFilterSection
                book={book}
                chapter={chapter}
                language={language}
                onBookChange={setBook}
                onChapterChange={setChapter}
                onLanguageChange={setLanguage}
            />
        
            <h2 className={styles.bookTitle}>{bookName} {chapter}</h2>
        
            {/* Navigation Arrows */}
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
        
            {/* Verses */}
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <div className={styles.verseContainer}>
                {verses.map(({ verse, text }) => (
                    <p key={verse} className={styles.verseText}>
                    <sup className={styles.verseNumber}>{verse}</sup> {text}
                    </p>
                ))}
                </div>
            )}
            </div>
        </div>
    );
          
};

export default Page;
