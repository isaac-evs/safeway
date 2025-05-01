import { createContext, useState, useContext } from "react";
import { mockEvents } from "../data/mockEvents";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const closeWelcome = () => setShowWelcome(false);

  return (
    <AppContext.Provider
      value={{
        showWelcome,
        setShowWelcome,
        closeWelcome,
        darkMode,
        toggleDarkMode,
        selectedEvent,
        setSelectedEvent,
        eventsLoaded,
        setEventsLoaded,
        mockEvents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
