import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

export default function LoadingScreen() {
  const { darkMode } = useAppContext();

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 0, 270, 270, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      >
        <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full" />
      </motion.div>
      <p
        className={`absolute mt-32 text-lg font-medium ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Cargando ...
      </p>
    </motion.div>
  );
}
