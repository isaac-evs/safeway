import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

export default function EventDetails({ event }) {
  const { setSelectedEvent, darkMode } = useAppContext();

  const closeDetails = () => {
    setSelectedEvent(null);
  };

  const handleReadMore = () => {
    // Open the URL in a new tab
    window.open(event.url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        className={`rounded-lg shadow-xl p-6 mx-4 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{event.title}</h3>
          <button
            onClick={closeDetails}
            className={`p-1 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <p className="mb-2">{event.description}</p>
          <p className="text-sm opacity-75">Date: {event.date}</p>
        </div>
        <div className="flex justify-between">
          <span
            className={`px-3 py-1 rounded-full text-sm ${getEventTypeStyles(event.type)}`}
          >
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </span>
          <motion.button
            className={`px-4 py-1 rounded-lg ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReadMore}
          >
            Leer Más
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// In the getEventTypeStyles function within src/components/EventDetails/EventDetails.jsx
function getEventTypeStyles(type) {
  const styles = {
    crime: "bg-red-100 text-red-800",
    infrastructure: "bg-blue-100 text-blue-800",
    hazard: "bg-yellow-100 text-yellow-800",
    social: "bg-green-100 text-green-800",
    default: "bg-gray-100 text-gray-800",
  };
  return styles[type] || styles.default;
}
