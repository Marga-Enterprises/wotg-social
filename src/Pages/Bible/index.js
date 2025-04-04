import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";
import bibleBooks from "./data";
import { useLocation, useNavigate } from "react-router-dom";

// SECTIONS
import BibleFilterSection from "../../sections/BibleFilterSection";
import BibleVersesAction from "../../sections/BibleVersesAction";

const Page = () => {
    const dispatch = useDispatch();
    const loadingRef = useRef(false);
    const syncTimeout = useRef(null);
    const verseRefs = useRef({});

    const location = useLocation();
    const navigate = useNavigate();

    const [book, setBook] = useState(1);
    const [chapter, setChapter] = useState(1);
    const [language, setLanguage] = useState("eng");
    const [highlightedVerses, setHighlightedVerses] = useState({});
    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVerse, setActiveVerse] = useState(null); // 👈 New

    const [verseStyle, setVerseStyle] = useState({
        fontSize: "20px",
        fontFamily: "Arial",
        fontColor: "#000000",
    });

    const bookName = useMemo(() => bibleBooks.find(b => b.id === book)?.name?.[language] || `Book ${book}`, [book, language]);
    const highlightKey = useMemo(() => `highlighted_${book}_${chapter}_${language}`, [book, chapter, language]);

    // ✅ Load initial state from URL params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
      
        const b = parseInt(params.get("book")) || 1;
        const c = parseInt(params.get("chapter")) || 1;
      
        // Get from localStorage first
        const storedLang = localStorage.getItem("bible_language");
        const paramLang = params.get("language");
        const lang = storedLang || paramLang || "eng";
      
        setBook(b);
        setChapter(c);
        setLanguage(lang);
      
        // Sync URL with stored language if it's different
        if (storedLang && storedLang !== paramLang) {
            params.set("language", storedLang);
            if (paramLang !== storedLang) {
              window.history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
            }
        }          
    }, []); 

    useEffect(() => {
        try {
          const savedStyle = localStorage.getItem("bible_style");
          if (savedStyle) {
            setVerseStyle(JSON.parse(savedStyle));
          }
        } catch (e) {
          console.warn("Invalid style in localStorage");
        }
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
        // setError(null);

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
            // setError("⚠️ Failed to load verses.");
            console.error("Fetch error:", err);
        }

        //window.scrollTo({ top: 0, behavior: "auto" });
        setLoading(false);
    }, [dispatch, book, chapter, language]);

    useEffect(() => {
        const scrollKey = `highlighted_${book}_${chapter}_${language}_scrollTo`;
        const scrollToId = localStorage.getItem(scrollKey);
      
        if (!loading && verses.length && scrollToId) {
          const targetVerse = parseInt(scrollToId.split("-")[1]);
      
          setTimeout(() => {
            const el = verseRefs.current[targetVerse];
            if (el) {
              el.scrollIntoView({ behavior: "auto", block: "center" });
              console.log(`✅ Scrolled to verse ${targetVerse}`);
            } else {
              console.warn(`❌ Verse ${targetVerse} not found in refs.`);
            }
          }, 500);
        }
    }, [loading, verses, book, chapter, language]);  

    useEffect(() => {
        loadingRef.current = false;
        fetchVerses();
    }, [fetchVerses]);

    const handleNext = useCallback(() => {
        const currentBook = bibleBooks.find(b => b.id === book);
        if (!currentBook) return;

        if (chapter < currentBook.chapters) {
            setChapter(prev => prev + 1);
        } else if (book < 66) {
            setBook(prev => prev + 1);
            setChapter(1);
        }
    }, [book, chapter]);

    const handlePrev = useCallback(() => {
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

    const handleVerseTap = (verseNumber, text, commentary) => {
        setActiveVerse({
            verse: verseNumber,
            text,
            commentary,
            book,
            chapter,
            language
          });          
    };      

    const handleHighlight = (verseNum, color) => {
        const updated = { ...highlightedVerses, [verseNum]: color };
        setHighlightedVerses(updated);
        localStorage.setItem(highlightKey, JSON.stringify(updated));
    };
      
      
    const isFirstChapter = book === 1 && chapter === 1;
    const isLastChapter = book === 66 && chapter === bibleBooks.find(b => b.id === 66)?.chapters;

    return (
        <>
            { loading ? (
                <LoadingSpinner />
            ) : (
                <div className={styles.mainContainer}>
                    <BibleFilterSection
                        book={book}
                        chapter={chapter}
                        language={language}
                        onBookChange={setBook}
                        onChapterChange={setChapter}
                        onLanguageChange={setLanguage}
                        onStyleChange={(style) => setVerseStyle((prev) => ({ ...prev, ...style }))}
                        onSearchVerse={({ bookId, chapter, verse }) => {
                            setBook(bookId);
                            setChapter(chapter);
                          
                            const scrollKey = `highlighted_${bookId}_${chapter}_${language}_scrollTo`;
                            const highlightKey = `highlighted_${bookId}_${chapter}_${language}`;
                          
                            if (verse) {
                              // 🟡 Highlight that verse
                              const newHighlights = { [verse]: "#fffaa0" };
                          
                              localStorage.setItem(highlightKey, JSON.stringify(newHighlights));
                              setHighlightedVerses(newHighlights);
                          
                              // 🟢 Scroll to that verse
                              localStorage.setItem(scrollKey, `verse-${verse}`);
                            } else {
                              localStorage.removeItem(scrollKey);
                              localStorage.removeItem(highlightKey);
                              setHighlightedVerses({});
                            }
                          
                            setActiveVerse(null);
                        }}  
                    />

                    <div className={styles.bibleReader}>
                        <h2 className={styles.bookTitle}>{bookName} {chapter}</h2>

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

                        <div className={styles.verseContainer}>
                            {verses.map(({ verse, text, commentary }) => (
                                <p
                                    key={verse}
                                    ref={(el) => verseRefs.current[verse] = el}
                                    className={`
                                        ${styles.verse}
                                        ${activeVerse?.verse === verse ? styles.activeVerse : ""}
                                    `}
                                    style={{
                                        ...verseStyle,
                                        backgroundColor: highlightedVerses[verse] || "transparent"
                                    }}
                                    onClick={() => handleVerseTap(verse, text, commentary)}
                                >
                                    <sup className={styles.verseNumber}>{verse}</sup> {text}
                                </p>
                            ))}
                        </div>
                    </div>

                    {activeVerse !== null && (
                        <BibleVersesAction
                            verse={activeVerse}
                            onHighlight={handleHighlight}
                            highlightedVerses={highlightedVerses}
                            onClose={() => setActiveVerse(null)}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default Page;
