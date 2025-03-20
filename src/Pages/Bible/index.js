import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import { convertMomentWithFormatWhole } from "../../utils/methods";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";
import wotgLogo from "./wotg-logo.webp";

const Page = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const loadingRef = useRef(false);

    const [bibles, setBibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBibles = async () => {
            setLoading(true);
            try {
                const response = await dispatch(wotgsocial.bible.getAllBiblesAction());

                console.log('[[[[[[BIBLE RESPONSE]]]]]]', response.data.data);
                if (response.data.data) {
                    setBibles(response.data.data);
                }
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        fetchBibles();
    }, [dispatch]);

    return (
        <>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className={styles.mainContainer}>
                    <div className={styles.navbar}>
                        <div className={styles.logo}>
                            <img src={wotgLogo} alt="WOTG Logo" />
                        </div>
                        <div className={styles.navLinks}>
                            <a href="/" className={styles.navLink}>Chat</a>
                            <a href="/worship" className={styles.navLink}>Worship</a>
                            <a href="https://wotgonline.com/donate/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Give</a>
                        </div>
                    </div>

                    <div className={styles.biblesContainer}>
                        <h2>Available Bibles</h2>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        <ul>
                            {bibles.length > 0 ? (
                                bibles.map((bible) => (
                                    <li key={bible.id}>
                                        {bible.name} ({bible.language.name})
                                    </li>
                                ))
                            ) : (
                                <p>No Bibles found.</p>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};

export default Page;
