import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { wotgsocial } from "../../redux/combineActions";

// Components
import LoadingSpinner from "../../components/LoadingSpinner";
import AddAlbumModal from "../../components/AddAlbumModal";
import UpdateAlbumModal from "../../components/UpdateAlbumModal";

// Styles
import styles from "./index.module.css";

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronLeft, faChevronRight, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

// Cookies
import Cookies from "js-cookie";

const Page = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loadingRef = useRef(false);
    const location = useLocation();

    const account = useMemo(() => {
        return Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
    }, []);

    const role = account?.user_role || null; 

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const currentPage = useMemo(() => parseInt(queryParams.get("page")) || 1, [queryParams]);

    const backendUrl = useMemo(() => {
        return process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://community.wotgonline.com/api";
    }, []);

    const [loading, setLoading] = useState(false);
    const [pageSize] = useState(10);
    const [albums, setAlbums] = useState([]);
    const [albumId, setAlbumId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [pageDetails, setPageDetails] = useState({
        totalRecords: 0,
        pageIndex: currentPage,
        totalPages: 0
    });

    const handleRouteToMusicPage = (id) => {
        navigate(`/music-in-album/${id}`);
    };

    const handleAlbumsList = useCallback(async (pageIndex = 1) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await dispatch(wotgsocial.album.getAlbumsByParamsAction({ pageSize, pageIndex }));
            if (res.success) {
                setAlbums(res.data.albums);
                setPageDetails({
                    totalRecords: res.data.totalRecords,
                    pageIndex: res.data.pageIndex,
                    totalPages: res.data.totalPages,
                });

                // ✅ Sync page to URL
                navigate(`?page=${pageIndex}`, { replace: false });
            }
        } catch (error) {
            console.error("Error fetching albums:", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [dispatch, navigate]);

    const handleOpenUpdateModal = (id) => {
        setAlbumId(id);
        setShowUpdateModal(true);
    };

    const handleDeleteAlbum = useCallback(async (id) => {
        if (!window.confirm("Are you sure you want to delete this album? All its music and playlist links will be removed. This action cannot be undone.")) return;

        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await dispatch(wotgsocial.album.deleteAlbumAction({ id }));
            if (res.success) {
                setAlbums(prev => prev.filter(album => album.id !== id)); // Remove deleted album from state
                await handleAlbumsList(pageDetails.pageIndex);
            }
        } catch (error) {
            console.error("Error deleting album:", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [dispatch, pageDetails.pageIndex]);

    useEffect(() => {
        handleAlbumsList(currentPage);
    }, [handleAlbumsList, currentPage]);

    console.log('albumId', albumId);

    return (
        <>
            {loading && <LoadingSpinner />}
            <div className={styles.container}>
                <center className={styles.headingContainer}>
                  <h1 className={styles.heading}>Albums</h1>

                  { role === "admin" || role === "owner" ? (
                    <div className={styles.toolbar}>
                        <button className={styles.addButton} onClick={() => setShowModal(true)}>
                            <FontAwesomeIcon icon={faPlus} /> Add Album
                        </button>
                    </div>
                  ): null}
                </center>
                
                {/*<p className={styles.subheading}>Explore and manage your released albums here.</p>*/}

                <div className={styles.albumList}>
                    {albums?.length > 0 ? (
                        albums.map(album => (
                            <div key={album.id} className={styles.albumCard}>
                                <div className={styles.albumThumbWrapper} onClick={() => handleRouteToMusicPage(album.id)}>
                                    <img
                                        src={`${backendUrl}/uploads/${album.cover_image || "default-cover.png"}`}
                                        alt={album.title}
                                        loading="lazy"
                                        className={styles.albumImage}
                                    />
                                </div>
                                <div className={styles.albumInfo}>
                                    <div className={styles.albumTitle}>
                                        <h3 className={styles.albumTitleHeading}>{album.title}</h3>

                                        { role === "admin" || role === "owner" ? (
                                            <div>
                                                <span className={styles.albumCardActions}>
                                                    <button
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDeleteAlbum(album.id)}
                                                        title="Delete Album"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </span>

                                                <span className={styles.albumCardActions}>
                                                    <button
                                                        className={styles.editButton}
                                                        onClick={() => handleOpenUpdateModal(album.id)}
                                                        title="Delete Album"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                </span>
                                            </div>
                                        ): null}

                                    </div>
                                    <p>{album.artist_name}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && <p className={styles.noData}>No albums found.</p>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className={styles.pagination}>
                    {/* ⬅ Prev */}
                    <button
                        className={styles.arrowButton}
                        onClick={() => handleAlbumsList(pageDetails.pageIndex - 1)}
                        disabled={pageDetails.pageIndex <= 1 || loading}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    {/* Page buttons */}
                    {(() => {
                        const pageButtons = [];
                        const groupSize = 5;
                        const start = Math.floor((pageDetails.pageIndex - 1) / groupSize) * groupSize + 1;
                        const end = Math.min(start + groupSize - 1, pageDetails.totalPages);

                        for (let i = start; i <= end; i++) {
                            pageButtons.push(
                                <button
                                    key={i}
                                    className={`${styles.pageButton} ${
                                        pageDetails.pageIndex === i ? styles.active : ""
                                    }`}
                                    onClick={() => handleAlbumsList(i)}
                                    disabled={loading}
                                >
                                    {i}
                                </button>
                            );
                        }

                        return pageButtons;
                    })()}

                    {/* ➡ Next */}
                    <button
                        className={styles.arrowButton}
                        onClick={() => handleAlbumsList(pageDetails.pageIndex + 1)}
                        disabled={pageDetails.pageIndex >= pageDetails.totalPages || loading}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>

                <AddAlbumModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        handleAlbumsList(pageDetails.pageIndex); // optional: refresh after adding
                    }}
                />

                <UpdateAlbumModal
                  id={albumId}
                  isOpen={showUpdateModal}
                  onClose={() => {
                    setShowUpdateModal(false);
                    handleAlbumsList(pageDetails.pageIndex);
                    setAlbumId('');
                  }}
                />
            </div>
        </>
    );
};

export default Page;
