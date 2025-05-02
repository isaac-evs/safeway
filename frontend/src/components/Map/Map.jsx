import { useEffect } from "react";
import { motion } from "framer-motion";
import useMapbox from "../../hooks/useMapbox";
import { useAppContext } from "../../context/AppContext";
import EventDetails from "../EventDetails/EventDetails";
import SearchBar from "../SearchBar/SearchBar";

export default function Map() {
  // Get events from context instead of importing mockEvents
  const { darkMode, selectedEvent, events } = useAppContext();

  // Pass events from context to useMapbox hook
  const { mapContainer, map } = useMapbox(events);

  return (
    <motion.div
      className={`w-full h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div ref={mapContainer} className="w-full h-full" />
      {/* Pass the map reference to SearchBar */}
      <SearchBar map={map} />
      {/* Event Details Overlay */}
      {selectedEvent && <EventDetails event={selectedEvent} />}
    </motion.div>
  );
}
