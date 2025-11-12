// App.js
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { NavbarProvider } from "./contexts/NavbarContext";
import { SocketProvider } from "./contexts/SocketContext";
import { usePushSubscription } from "./hooks/usePushSubscription";
import MusicControlsSection from './sections/MusicControlsSection';

import Cookies from 'js-cookie';

function App() {
  const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
  const isAuthenticated = Cookies.get('authenticated') === 'true';

  usePushSubscription(account, isAuthenticated);

  return (
    <BrowserRouter>
      <SocketProvider>
        <NavbarProvider>
          <AppRoutes />
          <MusicControlsSection />
        </NavbarProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
