import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AppProvider, useAppContext } from "./context/AppContext";
import Map from "./components/Map/Map";
import WelcomeMenu from "./components/WelcomeMenu/WelcomeMenu";
import DarkModeToggle from "./components/UI/DarkModeToggle";
import LoadingScreen from "./components/UI/LoadingScreen";
import FeedPanel from "./components/FeedPanel/FeedPanel";

function AppContent() {
  const { showWelcome, eventsLoaded } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{isLoading && <LoadingScreen />}</AnimatePresence>

      <Map />
      <DarkModeToggle />
      <FeedPanel />

      <AnimatePresence>
        {showWelcome && !isLoading && <WelcomeMenu />}
      </AnimatePresence>
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
