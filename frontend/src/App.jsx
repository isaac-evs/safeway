import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AppProvider, useAppContext } from "./context/AppContext";
import Map from "./components/Map/Map";
import WelcomeMenu from "./components/WelcomeMenu/WelcomeMenu";
import DarkModeToggle from "./components/UI/DarkModeToggle";
import LoadingScreen from "./components/UI/LoadingScreen";
import FeedPanel from "./components/FeedPanel/FeedPanel";

function AppContent() {
  const { showWelcome, eventsLoaded, error } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for events to load or fail before removing loading screen
    if (eventsLoaded) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [eventsLoaded]);

  return (
    <>
      <AnimatePresence>{isLoading && <LoadingScreen />}</AnimatePresence>

      {!isLoading && (
        <>
          <Map />
          <DarkModeToggle />
          <FeedPanel />

          {/* Display error message if there was an API error */}
          {error && <div className="error-notification">{error}</div>}

          <AnimatePresence>{showWelcome && <WelcomeMenu />}</AnimatePresence>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
