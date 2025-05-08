// src/map/Map.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMapbox from "../../hooks/useMapbox";
import { useAppContext } from "../../context/AppContext";
import EventDetails from "../EventDetails/EventDetails";
import NavigationBar from "../NavigationBar/NavigationBar";
import DarkModeToggle from "../UI/DarkModeToggle";
import { Layers, Map as MapIcon } from "lucide-react";

export default function Map() {
  // Get events and context
  const { darkMode, selectedEvent, events, toggleDarkMode } = useAppContext();
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const mapLayersRef = useRef({
    traffic: true,
    terrain: false,
    satellite: false,
  });
  const [mapLayers, setMapLayers] = useState(mapLayersRef.current);

  // Store if traffic is initialized
  const trafficInitialized = useRef(false);

  // Pass events from context to useMapbox hook
  const { mapContainer, map } = useMapbox(events);

  // Handle window resize to detect mobile - with debouncing
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      if (isMobile !== isMobileView) {
        setIsMobile(isMobileView);
      }
    };

    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  // Initialize traffic layer when map loads
  useEffect(() => {
    if (!map?.current || trafficInitialized.current) return;

    const initTraffic = () => {
      if (!map.current.isStyleLoaded()) {
        setTimeout(initTraffic, 100);
        return;
      }

      try {
        if (!map.current.getSource("mapbox-traffic")) {
          map.current.addSource("mapbox-traffic", {
            type: "vector",
            url: "mapbox://mapbox.mapbox-traffic-v1",
          });
        }

        if (!map.current.getLayer("traffic")) {
          map.current.addLayer({
            id: "traffic",
            type: "line",
            source: "mapbox-traffic",
            "source-layer": "traffic",
            layout: {
              "line-join": "round",
              "line-cap": "round",
              visibility: "visible",
            },
            paint: {
              "line-color": [
                "match",
                ["get", "congestion"],
                "low",
                "#4ade80",
                "moderate",
                "#facc15",
                "heavy",
                "#f97316",
                "severe",
                "#ef4444",
                "#4ade80",
              ],
              "line-width": 2,
            },
          });

          trafficInitialized.current = true;
        }
      } catch (error) {
        console.error("Error initializing traffic layer:", error);
        setTimeout(initTraffic, 500);
      }
    };

    if (map.current) {
      map.current.on("load", initTraffic);
      if (map.current.loaded()) initTraffic();
    }
    return () => {
      if (map?.current) map.current.off("load", initTraffic);
    };
  }, [map]);

  // Toggle map layers
  const toggleMapLayer = (layer) => {
    if (!map?.current) return;

    const newLayers = { ...mapLayers };
    newLayers[layer] = !newLayers[layer];
    mapLayersRef.current = newLayers;
    setMapLayers(newLayers);

    if (layer === "satellite") {
      map.current.setStyle(
        newLayers.satellite
          ? "mapbox://styles/mapbox/satellite-streets-v12"
          : darkMode
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/light-v11",
      );
      trafficInitialized.current = false;
    }

    if (layer === "traffic") {
      if (map.current.getLayer("traffic")) {
        map.current.setLayoutProperty(
          "traffic",
          "visibility",
          newLayers.traffic ? "visible" : "none",
        );
      } else if (newLayers.traffic) {
        try {
          if (!map.current.getSource("mapbox-traffic")) {
            map.current.addSource("mapbox-traffic", {
              type: "vector",
              url: "mapbox://mapbox.mapbox-traffic-v1",
            });
          }
          map.current.addLayer({
            id: "traffic",
            type: "line",
            source: "mapbox-traffic",
            "source-layer": "traffic",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": [
                "match",
                ["get", "congestion"],
                "low",
                "#4ade80",
                "moderate",
                "#facc15",
                "heavy",
                "#f97316",
                "severe",
                "#ef4444",
                "#4ade80",
              ],
              "line-width": 2,
            },
          });
        } catch (error) {
          console.error("Error adding traffic layer:", error);
        }
      }
    }

    if (layer === "terrain") {
      if (newLayers.terrain) {
        try {
          if (!map.current.getSource("mapbox-dem")) {
            map.current.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.mapbox-terrain-dem-v1",
              tileSize: 512,
              maxzoom: 14,
            });
          }
          map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        } catch (error) {
          console.error("Error adding terrain:", error);
        }
      } else map.current.setTerrain(null);
    }
  };

  return (
    <motion.div
      className={`w-full h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div ref={mapContainer} className="w-full h-full" />
      <NavigationBar map={map} />

      {/* Bottom Controls: mobile dark toggle & desktop map controls */}
      <div className="fixed bottom-4 right-4 z-10 flex items-center">
        {/* Mobile Dark Mode Toggle */}
        <motion.button
          className={`p-3 rounded-full shadow-lg mr-2 md:hidden ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
          onClick={toggleDarkMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          {darkMode ? (
            /* sun icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            /* moon icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </motion.button>

        {/* Desktop Map Layers & Controls */}
        <div className="hidden md:flex items-center">
          <motion.button
            onClick={() => setShowControls(!showControls)}
            className={`p-3 rounded-full shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MapIcon size={20} />
          </motion.button>
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`absolute bottom-16 right-0 p-3 rounded-lg shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
              >
                <div className="space-y-2">
                  {/* traffic, terrain, satellite buttons... same as before */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-10 hidden md:block">
        <DarkModeToggle />
      </div>

      {/* Event Details (desktop only) */}
      {selectedEvent && !isMobile && <EventDetails event={selectedEvent} />}
    </motion.div>
  );
}
