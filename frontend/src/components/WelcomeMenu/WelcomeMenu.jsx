// src/components/WelcomeMenu/WelcomeMenu.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import {
  Truck,
  MapPin,
  Navigation,
  AlertTriangle,
  Shield,
  Users,
  Building,
  ArrowRight,
  X,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Globe,
} from "lucide-react";

export default function WelcomeMenu() {
  const { closeWelcome, darkMode } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Tutorial steps
  const steps = [
    {
      title: "Bienvenido a Safeway",
      description:
        "Tu herramienta esencial para planificar rutas seguras y eficientes en todo México. Descubre cómo funciona con un recorrido rápido.",
      icon: <Truck size={28} color="white" />,
      demo: "intro",
    },
    {
      title: "Navegación con Prioridad en la Seguridad",
      description:
        "Detecta automáticamente peligros, zonas con alta incidencia delictiva y otros riesgos a lo largo de tu ruta.",
      icon: <Shield size={28} color="white" />,
      demo: "safety",
    },
    {
      title: "Rutas Especializadas para Camiones",
      description:
        "Optimizadas para vehículos de carga con parámetros personalizados de altura, peso y tipo de carga para trayectos más seguros.",
      icon: <Truck size={28} color="white" />,
      demo: "truck",
    },
    {
      title: "Eventos en Tiempo Real",
      description: "Monitorea eventos que pueden afectar tu ruta:",
      categories: true,
      icon: <AlertTriangle size={28} color="white" />,
      demo: "events",
    },
    {
      title: "Comienza a Navegar Seguro",
      description:
        "La seguridad de tu flota es nuestra prioridad. Inicia tu trayecto con confianza y datos en tiempo real.",
      icon: <CheckCircle size={28} color="white" />,
      demo: "final",
    },
  ];

  // Información de categorías de eventos
  const eventCategories = [
    {
      type: "crime",
      title: "Incidentes Delictivos",
      description: "Zonas con actividad delictiva reportada",
      color: "red",
      icon: <Shield size={18} />,
    },
    {
      type: "hazard",
      title: "Peligros en la Vía",
      description: "Construcción, accidentes y obstáculos",
      color: "yellow",
      icon: <AlertTriangle size={18} />,
    },
    {
      type: "infrastructure",
      title: "Infraestructura",
      description: "Cierres viales y obras en curso",
      color: "blue",
      icon: <Building size={18} />,
    },
    {
      type: "social",
      title: "Concentraciones Sociales",
      description: "Eventos que generan congestión vehicular",
      color: "green",
      icon: <Users size={18} />,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  };

  // Skip to final step
  const skipToFinal = () => {
    setCurrentStep(steps.length - 1);
  };

  // Go to next step
  const nextStep = () => {
    if (animating) return;

    if (currentStep < steps.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setAnimating(false);
      }, 300);
    } else {
      closeWelcome();
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (animating) return;

    if (currentStep > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnimating(false);
      }, 300);
    }
  };

  // Current step data
  const currentStepData = steps[currentStep];

  // Demo components based on current step
  const renderDemoContent = () => {
    switch (currentStepData.demo) {
      case "intro":
        return (
          <div className="mx-auto w-full max-w-sm">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-3 rounded-lg shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              <div className="flex items-center">
                <MapPin className="text-gray-400 mr-2" size={20} />
                <div className="flex-grow">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-gray-400"
                  >
                    Ingresa el destino...
                  </motion.span>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Navigation className="text-blue-500 ml-2" size={20} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <div className="bg-blue-500/20 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg px-4 py-2 flex items-center text-sm">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight size={16} className="mr-2" />
                </motion.div>
                Simplemente ingresa tu destino para comenzar a navegar
              </div>
            </motion.div>
          </div>
        );

      case "safety":
        return (
          <div className="mx-auto w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-3 rounded-lg shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <Navigation className="text-blue-500 mr-2" size={18} />
                  <span className="font-medium text-sm">
                    Nuevo León → Guadalajara
                  </span>
                </div>
                <X size={16} className="text-gray-400" />
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 text-gray-500" />
                  <span>6h 20m</span>
                </div>
                <div className="flex items-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center"
                  >
                    <AlertTriangle size={14} className="mr-1 text-yellow-500" />
                    <span className="font-medium text-yellow-500">
                      4 alertas
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`mt-4 p-3 rounded-lg border-l-4 border-yellow-500 shadow-lg ${
                darkMode ? "bg-gray-800/90" : "bg-white"
              }`}
            >
              <div className="flex">
                <AlertTriangle
                  className="text-yellow-500 mr-2 flex-shrink-0"
                  size={18}
                />
                <div>
                  <div className="font-medium text-sm">
                    Alertas de seguridad
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-2 space-y-1"
                  >
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      <span>Incidente delictivo cerca del km 102</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Obras viales en Michoacán</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case "truck":
        return (
          <div className="mx-auto w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-lg shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <Truck size={16} className="mr-2 text-blue-500" />
                Parametros del vehiculo
              </h4>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-3 mb-3"
              >
                <div
                  className={`p-2 rounded text-center ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">Altura</div>
                  <motion.div
                    className="font-medium"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    4.0m
                  </motion.div>
                </div>
                <div
                  className={`p-2 rounded text-center ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">Peso</div>
                  <div className="font-medium">20t</div>
                </div>
                <div
                  className={`p-2 rounded text-center ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">Carga</div>
                  <div className="font-medium">Standard</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-2 rounded"
              >
                <CheckCircle size={12} className="inline mr-1" />
                Ruta optimizada para la altura del camión
                <motion.div
                  className="mt-1 ml-5 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  Evitando 2 puentes bajos
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        );

      case "events":
        return (
          <div className="mx-auto w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`relative rounded-lg overflow-hidden ${isMobile ? "h-36" : "h-44"} shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              {/* Simple map background */}
              <div
                className={`absolute inset-0 ${
                  darkMode ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-500 transform -translate-y-1/2"></div>
                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              </div>

              {/* Event markers */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-red-500 flex items-center justify-center text-white border-2 border-white`}
                >
                  <Shield size={isMobile ? 10 : 12} />
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute top-1/3 right-1/3 transform -translate-y-1/2"
              >
                <div
                  className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-yellow-500 flex items-center justify-center text-white border-2 border-white`}
                >
                  <AlertTriangle size={isMobile ? 10 : 12} />
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-1/3 left-1/3 transform -translate-x-1/2"
              >
                <div
                  className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-blue-500 flex items-center justify-center text-white border-2 border-white`}
                >
                  <Building size={isMobile ? 10 : 12} />
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-1/4 right-1/4 transform -translate-y-1/2"
              >
                <div
                  className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-green-500 flex items-center justify-center text-white border-2 border-white`}
                >
                  <Users size={isMobile ? 10 : 12} />
                </div>
              </motion.div>

              {/* Animated truck - only visible on non-mobile devices */}
              {!isMobile && (
                <motion.div
                  className="absolute top-1/2 transform -translate-y-1/2"
                  initial={{ x: -20 }}
                  animate={{ x: 240 }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    repeatType: "loop",
                  }}
                >
                  <Truck size={20} className="text-gray-800 dark:text-white" />
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      case "final":
        return (
          <div className="mx-auto w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative flex justify-center items-center"
            >
              <div
                className={`relative ${isMobile ? "w-24 h-24" : "w-32 h-32"} flex items-center justify-center`}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`absolute ${isMobile ? "w-24 h-24" : "w-32 h-32"} rounded-full ${
                    darkMode ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                ></motion.div>

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: "linear",
                  }}
                  className="absolute w-full h-full flex items-center justify-center"
                >
                  <Globe
                    size={isMobile ? 60 : 80}
                    className="text-blue-500 opacity-50"
                  />
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="absolute"
                >
                  <div className="relative">
                    <Truck
                      size={isMobile ? 22 : 28}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        repeat: 3,
                        duration: 1,
                        delay: 1.5,
                      }}
                      className={`absolute -top-1 -right-1 ${isMobile ? "w-3 h-3" : "w-4 h-4"} rounded-full bg-green-500 flex items-center justify-center`}
                    >
                      <CheckCircle
                        size={isMobile ? 8 : 10}
                        className="text-white"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-4 text-center"
            >
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Monitoreo de ruta en tiempo real y alertas de seguridad
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Navega con confianza por todo México
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm overflow-y-auto py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`rounded-xl shadow-2xl ${isMobile ? "w-[95%]" : "max-w-3xl w-full mx-4"} overflow-hidden ${
          darkMode
            ? "bg-gray-900 text-white border border-gray-800"
            : "bg-white text-gray-800 border border-gray-200"
        }`}
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 100,
        }}
      >
        {/* Header */}
        <div
          className={`${isMobile ? "p-4" : "p-6"} border-b border-gray-800 dark:border-gray-700 flex justify-between items-center`}
        >
          <div className="flex items-center">
            <motion.div
              className={`${isMobile ? "mr-3" : "mr-4"}`}
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div
                className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-full flex items-center justify-center ${
                  darkMode ? "bg-blue-600" : "bg-blue-500"
                }`}
              >
                {currentStepData.icon}
              </div>
            </motion.div>
            <div>
              <motion.h2
                className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {currentStepData.title}
              </motion.h2>
            </div>
          </div>
          <button
            onClick={closeWelcome}
            className={`p-2 rounded-full hover:bg-gray-800/20`}
          >
            <X size={isMobile ? 18 : 20} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-3 flex">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full flex-1 mx-0.5 ${
                index === currentStep
                  ? darkMode
                    ? "bg-blue-500"
                    : "bg-blue-600"
                  : index < currentStep
                    ? darkMode
                      ? "bg-blue-800"
                      : "bg-blue-300"
                    : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>

        {/* Main content */}
        <div
          className={`${isMobile ? "grid grid-cols-1" : "grid md:grid-cols-2"} gap-6`}
        >
          {/* Left side - Description */}
          <div className={`${isMobile ? "p-4" : "p-6"}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentStep}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-base mb-6 leading-relaxed"
                >
                  {currentStepData.description}
                </motion.p>

                {/* Categories (only shown in step 4) */}
                {currentStepData.categories && (
                  <motion.div
                    variants={containerVariants}
                    className="mb-4 space-y-2"
                  >
                    {eventCategories.map((category) => (
                      <motion.div
                        key={category.type}
                        variants={itemVariants}
                        className={`flex items-center p-2 rounded-lg ${
                          darkMode ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <div
                          className={`${isMobile ? "w-7 h-7" : "w-8 h-8"} rounded-full bg-${category.color}-500 flex items-center justify-center text-white mr-3`}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <span className="font-medium text-sm">
                            {category.title}
                          </span>
                          <p className="text-xs opacity-70">
                            {category.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right side - Demo/Visualization (hidden on mobile if at the categories step) */}
          {!(isMobile && currentStepData.categories) && (
            <div
              className={`${isMobile ? "p-4" : "p-6"} flex items-center ${
                darkMode ? "bg-gray-800/50" : "bg-gray-50"
              } ${isMobile ? "" : "rounded-tl-3xl"}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`demo-${currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  {renderDemoContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer with navigation buttons */}
        <div
          className={`${isMobile ? "p-4" : "p-6"} border-t border-gray-800 dark:border-gray-700 flex justify-between`}
        >
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className={`${isMobile ? "px-3 py-1.5" : "px-4 py-2"} rounded-lg flex items-center ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                } text-sm font-medium transition-colors`}
                disabled={animating}
              >
                <ChevronLeft size={16} className="mr-1" />
                Atrás
              </button>
            )}

            {!currentStepData.final &&
              currentStep < steps.length - 2 &&
              !isMobile && (
                <button
                  onClick={skipToFinal}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  } text-sm transition-colors`}
                  disabled={animating}
                >
                  Saltar
                </button>
              )}
          </div>

          <motion.button
            className={`${isMobile ? "px-4 py-1.5" : "px-6 py-2"} rounded-lg font-medium transition-colors flex items-center ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            onClick={nextStep}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={animating}
          >
            {currentStepData.final ? "Comenzar" : "Siguiente"}
            <ChevronRight size={18} className="ml-1" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
