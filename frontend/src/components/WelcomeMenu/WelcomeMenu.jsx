import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

export default function WelcomeMenu() {
  const { closeWelcome, darkMode } = useAppContext();

  // Category icon SVGs
  const icons = {
    crime: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m12 8 4 4"/><path d="M12 12v4"/></svg>`,
    infrastructure: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
    hazard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    social: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 backdrop-blur-sm ${
          darkMode
            ? "bg-gray-800/90 text-white border border-gray-700"
            : "bg-white/90 text-gray-800 border border-gray-200"
        }`}
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 100,
        }}
      >
        <div className="mb-6 text-center">
          <motion.div
            className="inline-block mb-3"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                darkMode ? "bg-blue-600" : "bg-blue-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Mexico News Globe
          </motion.h1>

          <motion.p
            className="text-lg opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.4 }}
          >
            Explore news and events across Mexico on an interactive 3D globe
          </motion.p>
        </div>

        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-semibold mb-4">Event Categories:</h2>

          <motion.div className="space-y-3" variants={containerVariants}>
            <motion.div
              variants={itemVariants}
              className={`flex items-center p-3 rounded-lg ${
                darkMode ? "bg-gray-700/50" : "bg-gray-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center mr-3">
                <div dangerouslySetInnerHTML={{ __html: icons.crime }}></div>
              </div>
              <div>
                <span className="font-medium">Crime Incidents</span>
                <p className="text-sm opacity-70">
                  Safety alerts and crime reports
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`flex items-center p-3 rounded-lg ${
                darkMode ? "bg-gray-700/50" : "bg-gray-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                <div
                  dangerouslySetInnerHTML={{ __html: icons.infrastructure }}
                ></div>
              </div>
              <div>
                <span className="font-medium">Infrastructure Projects</span>
                <p className="text-sm opacity-70">
                  Construction and development updates
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`flex items-center p-3 rounded-lg ${
                darkMode ? "bg-gray-700/50" : "bg-gray-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center mr-3">
                <div dangerouslySetInnerHTML={{ __html: icons.hazard }}></div>
              </div>
              <div>
                <span className="font-medium">Hazard Warnings</span>
                <p className="text-sm opacity-70">
                  Weather and environmental alerts
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`flex items-center p-3 rounded-lg ${
                darkMode ? "bg-gray-700/50" : "bg-gray-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mr-3">
                <div dangerouslySetInnerHTML={{ __html: icons.social }}></div>
              </div>
              <div>
                <span className="font-medium">Social Events</span>
                <p className="text-sm opacity-70">
                  Community gatherings and festivals
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.button
          className={`w-full py-3 rounded-lg font-bold transition-colors shadow-lg ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          onClick={closeWelcome}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Explore Now
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
