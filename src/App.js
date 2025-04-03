import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { useState } from "react";
import { NavbarProvider } from "./contexts/NavbarContext";

function App() {
  const [hideNavbar, setHideNavbar] = useState(false);

  return (
    <BrowserRouter>
      <NavbarProvider>
        <AppRoutes />
      </NavbarProvider>
    </BrowserRouter>
  );
}

export default App;
