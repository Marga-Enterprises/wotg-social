import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useHideNavbar } from "./contexts/NavbarContext";
import { wotgsocial } from "./redux/combineActions";
import Cookies from 'js-cookie';

// Components
import Navbar from "./components/Navbar";
import BurgerMenu from "./components/BurgerMenu";
import AuthRouter from "./components/AuthRouter";
import AdminRouter from "./components/AdminRouter";
// import ManagementRouter from "./components/ManagementRouter";

// Pages
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Worship from "./Pages/Worship";
import Menu from "./Pages/Menu";
import Bible from "./Pages/Bible";
import Default from "./Pages/Default";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Blogs from "./Pages/Blogs";
import BlogDetails from "./Pages/BlogDetails";
import UploadVideo from "./Pages/UploadVideo";
import WatchVideo from "./Pages/WatchVideo";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Journal from "./Pages/Journal";
import YourJournals from "./Pages/YourJournals";
import Commentary from "./Pages/Commentary";
import UploadVideoFromFiles from "./Pages/UploadVideoFromFiles";
import ViewJournalPage from "./Pages/ViewJournalPage";
import UpdateJournal from "./Pages/UpdateJournal";
import AdminMusicDashboard from "./Pages/AdminMusicDashboard";
import MusicInAlbumPage from "./Pages/MusicInAlbumPage";
import MainMusic from "./Pages/MainMusic";
import Playlist from "./Pages/Playlist";
import Feeds from "./Pages/Feeds";
import Notifications from "./Pages/Notifications";

function AppRoutes() {
  const dispatch = useDispatch();
  const hideNavbar = useHideNavbar();
  const navigate = useNavigate();
  
  const token = Cookies.get('token');
  const autoLoginDisabled = Cookies.get('autoLoginDisabled');

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(wotgsocial.user.restoreSessionAction());

    if (!token && !autoLoginDisabled) {
      dispatch(wotgsocial.user.guestLoginFunction())
        .then((res) => {
          if (res.success) {
            navigate('/');
          } else {
            console.error('Guest login failed:', res.payload);
          }
        })
        .catch((error) => {
          console.error('An error occurred during guest login:', error);
        });
    }
  }, [dispatch, autoLoginDisabled]);

  return (
    <div className="grid-container">
      {!hideNavbar && <Navbar onToggleMenu={() => setMenuOpen(true)} />}

      <AnimatePresence>
        {menuOpen && <BurgerMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>

      <main>
        <Routes>
          <Route path="/chat" element={<AuthRouter><Home onToggleMenu={() => setMenuOpen(true)} /></AuthRouter>} />
          <Route path="/worship" element={<Worship />} />
          <Route path="/" element={<AuthRouter><Menu /></AuthRouter>} />
          <Route path="/blogs" element={<AuthRouter><Blogs /></AuthRouter>} />
          <Route path="/bible" element={<AuthRouter><Bible /></AuthRouter>} />
          <Route path="/blog/:id" element={<AuthRouter><BlogDetails /></AuthRouter>} />
          <Route path="/journal/:book/:chapter/:verse/:language/" element={<AuthRouter><Journal /></AuthRouter>} />
          <Route path="/your-journals" element={<AuthRouter><YourJournals /></AuthRouter>} />
          <Route path="/view-journal/:id" element={<AuthRouter><ViewJournalPage /></AuthRouter>} />
          <Route path="/update-journal/:id" element={<AuthRouter><UpdateJournal /></AuthRouter>} />
          <Route path="/commentary/:book/:chapter/:verse/:language/" element={<AuthRouter><Commentary /></AuthRouter>} />
          <Route path="/notifications" element={<AuthRouter><Notifications /></AuthRouter>} />
          <Route path="/blog/record-video/:id" element={<AdminRouter><UploadVideo /></AdminRouter>} />
          <Route path="/blog/upload-video/:id" element={<AdminRouter><UploadVideoFromFiles /></AdminRouter>} />
          <Route path="/albums" element={<AuthRouter><AdminMusicDashboard /></AuthRouter>} />
          <Route path="/album/:id" element={<AuthRouter><MusicInAlbumPage /></AuthRouter>} />
          <Route path="/playlist/:id" element={<AuthRouter><Playlist /></AuthRouter>} />
          <Route path="/blog/watch-video/:id" element={<AuthRouter><WatchVideo /></AuthRouter>} />
          <Route path="/music" element={<AuthRouter><MainMusic/></AuthRouter>} />
          <Route path="/feeds" element={<AuthRouter><Feeds /></AuthRouter>} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Default />} />
        </Routes>
      </main>
    </div>
  );
}

export default AppRoutes;
