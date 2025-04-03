import { createContext, useContext, useState, useMemo } from "react";

// Create two contexts
const HideNavbarStateContext = createContext(false);
const HideNavbarDispatchContext = createContext(() => {});

export const NavbarProvider = ({ children }) => {
  const [hideNavbar, setHideNavbar] = useState(false);

  const memoizedState = useMemo(() => hideNavbar, [hideNavbar]);
  const memoizedSetter = useMemo(() => setHideNavbar, []);

  return (
    <HideNavbarStateContext.Provider value={memoizedState}>
      <HideNavbarDispatchContext.Provider value={memoizedSetter}>
        {children}
      </HideNavbarDispatchContext.Provider>
    </HideNavbarStateContext.Provider>
  );
};

// Hook to read hideNavbar
export const useHideNavbar = () => useContext(HideNavbarStateContext);

// Hook to update hideNavbar
export const useSetHideNavbar = () => useContext(HideNavbarDispatchContext);
