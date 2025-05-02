import { createContext, useState, useContext, useEffect } from "react";
import { mockEvents } from "../data/mockEvents";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [events, setEvents] = useState(mockEvents);
  const [error, setError] = useState(null);

  // Function to fetch news data from backend
  const fetchNewsData = async () => {
    try {
      setEventsLoaded(false);
      const response = await axios.get("http://localhost:8000/api/news/today");

      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data);
        console.log("Loaded news data from API:", response.data);
      } else {
        // If no data or invalid format, keep using mock data
        console.warn(
          "API returned invalid data format, using mock data instead",
        );
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching news data:", err);
      setError("Failed to load live news data. Using mock data instead.");
      // Keep using mock data on error
    } finally {
      setEventsLoaded(true);
    }
  };

  // Fetch news data when the app loads
  useEffect(() => {
    fetchNewsData();
  }, []);

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
        events, // Use the fetched events instead of directly using mockEvents
        error,
        refreshNewsData: fetchNewsData, // Expose function to manually refresh data
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
