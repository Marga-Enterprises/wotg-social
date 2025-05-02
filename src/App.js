import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { NavbarProvider } from "./contexts/NavbarContext";

import MusicControlsSection from './sections/MusicControlsSection';

function App() {
  return (
    <BrowserRouter>
      <NavbarProvider>
        <AppRoutes />
        <MusicControlsSection />
      </NavbarProvider>
    </BrowserRouter>
  );
}

export default App;
