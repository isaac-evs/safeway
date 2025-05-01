// src/components/UI/ErrorMessage.jsx
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

export default function ErrorMessage({ message, onRetry }) {
  const { darkMode } = useAppContext();

  return (
    <motion.div
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
    >
      <div
        className={`px-6 py-3 rounded-lg shadow-lg ${
          darkMode ? "bg-red-900 text-white" : "bg-red-100 text-red-800"
        }`}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p>{message}</p>
          {onRetry && (
            <button
              className={`ml-4 px-3 py-1 rounded ${
                darkMode
                  ? "bg-blue-700 hover:bg-blue-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
