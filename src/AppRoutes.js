import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useHideNavbar } from "./contexts/NavbarContext";
import { wotgsocial } from "./redux/combineActions";

// Components
import Navbar from "./components/Navbar";
import BurgerMenu from "./components/BurgerMenu";
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
import AllJournals from "./Pages/AllJournals";
import Commentary from "./Pages/Commentary";
import UploadVideoFromFiles from "./Pages/UploadVideoFromFiles";

function AppRoutes() {
  const dispatch = useDispatch();
  const hideNavbar = useHideNavbar();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(wotgsocial.user.restoreSessionAction());
  }, [dispatch]);

  return (
    <div className="grid-container">
      {!hideNavbar && <Navbar onToggleMenu={() => setMenuOpen(true)} />}

      <AnimatePresence>
        {menuOpen && <BurgerMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>

      <main>
        <Routes>
          <Route path="/" element={<AuthRouter><Home /></AuthRouter>} />
          <Route path="/worship" element={<AuthRouter><Worship /></AuthRouter>} />
          <Route path="/menu" element={<AuthRouter><Menu /></AuthRouter>} />
          <Route path="/blogs" element={<AuthRouter><Blogs /></AuthRouter>} />
          <Route path="/bible" element={<AuthRouter><Bible /></AuthRouter>} />
          <Route path="/blog/:id" element={<AuthRouter><BlogDetails /></AuthRouter>} />
          <Route path="/journal/:book/:chapter/:verse/:language/" element={<AuthRouter><Journal /></AuthRouter>} />
          <Route path="/your-journals" element={<AuthRouter><YourJournals /></AuthRouter>} />
          <Route path="/all-journals" element={<AuthRouter><AllJournals /></AuthRouter>} />
          <Route path="/commentary/:book/:chapter/:verse/:language/" element={<AuthRouter><Commentary /></AuthRouter>} />
          <Route path="/blog/record-video/:id" element={<AdminRouter><UploadVideo /></AdminRouter>} />
          <Route path="/blog/upload-video/:id" element={<AdminRouter><UploadVideoFromFiles /></AdminRouter>} />
          <Route path="/blog/watch-video/:id" element={<AuthRouter><WatchVideo /></AuthRouter>} />
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
