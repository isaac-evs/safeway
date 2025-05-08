import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

export default function FeedPanel() {
  // Replace mockEvents with events from context
  const { darkMode, setSelectedEvent, events } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on initial render and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for mobile devices
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="fixed top-0 left-0 h-full z-20">
      {/* Toggle Button - Hidden on Mobile */}
      {!isMobile && (
        <button
          onClick={togglePanel}
          className={`absolute top-4 ${isOpen ? "left-72" : "left-4"} z-30 p-2 rounded-full shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            )}
          </svg>
        </button>
      )}

      {/* Panel Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-72 h-full p-4 shadow-lg overflow-y-auto ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Eventos Recientes
            </h2>

            <div className="space-y-4">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`p-4 rounded-lg cursor-pointer ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 mr-2 flex-shrink-0"
                      style={{ backgroundColor: getEventColor(event.type) }}
                    />
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm opacity-75 mt-1">{event.date}</p>
                      <p className="text-sm mt-2">
                        {event.description.substring(0, 100)}...
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded mt-2 ${getEventTypeStyles(event.type)}`}
                      >
                        {event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getEventColor(type) {
  const colors = {
    crime: "#FF5733",
    infrastructure: "#33A8FF",
    hazard: "#FF3366",
    social: "#33FF57",
    default: "#888888",
  };

  return colors[type] || colors.default;
}

function getEventTypeStyles(type) {
  const styles = {
    crime: "bg-red-100 text-red-800",
    infrastructure: "bg-blue-100 text-blue-800",
    hazard: "bg-red-100 text-red-800",
    social: "bg-green-100 text-green-800",
    default: "bg-gray-100 text-gray-800",
  };

  return styles[type] || styles.default;
}
