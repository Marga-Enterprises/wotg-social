import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { wotgsocial } from "./redux/combineActions";
import Cookies from 'js-cookie';

// Components
import NewLayout from "./components/NewLayout"; // ✅ Use new layout
import AuthRouter from "./components/AuthRouter";
import AdminRouter from "./components/AdminRouter";

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
import Profile from "./Pages/Profile"; 
import Notifications from "./Pages/Notifications";
import Daan from "./Pages/DaanPapuntangLangit";
import LandingWelcomePage from "./Pages/LandingWelcomePage";

function AppRoutes() {
  const dispatch = useDispatch();
  const location = useLocation();

  const token = Cookies.get('token');
  const autoLoginDisabled = Cookies.get('autoLoginDisabled');

  // ✅ State for hamburger menu toggle
  const [menuOpen, setMenuOpen] = useState(false);
  const onToggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    if (!token && !autoLoginDisabled) {
      dispatch(wotgsocial.user.guestLoginFunction())
        .then((res) => {
          if (res.success) {
            console.log("Guest login successful:", location.pathname + location.search);
            window.location.href = location.pathname + location.search;
          } else {
            console.error("Guest login failed:", res.payload);
          }
        })
        .catch((error) => {
          console.error("An error occurred during guest login:", error);
        });
    }
  }, [dispatch, autoLoginDisabled, token]);

  return (
    <NewLayout onToggleMenu={onToggleMenu} menuOpen={menuOpen}>
      <Routes>
        <Route path="/chat" element={<AuthRouter><Home /></AuthRouter>} />
        <Route path="/landing" element={<LandingWelcomePage/>}/>
        <Route path="/worship" element={<Worship />} />
        <Route path="/" element={<AuthRouter><Menu /></AuthRouter>} />
        <Route path="/profile/:id" element={<AuthRouter><Profile /></AuthRouter>} />
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
        <Route path="/daan-papuntang-langit" element={<Daan />} />
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
    </NewLayout>
  );
}

export default AppRoutes;
