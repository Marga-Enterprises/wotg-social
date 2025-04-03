import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { NavbarProvider } from "./contexts/NavbarContext";

function App() {
  return (
    <BrowserRouter>
      <NavbarProvider>
        <AppRoutes />
      </NavbarProvider>
    </BrowserRouter>
  );
}

export default App;
