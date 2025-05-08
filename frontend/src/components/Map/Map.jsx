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

  // Handle window resize to detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize traffic layer when map loads
  useEffect(() => {
    if (!map?.current || trafficInitialized.current) return;

    const initTraffic = () => {
      if (!map.current.isStyleLoaded()) {
        // Wait for style to load before trying again
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

          // Mark as initialized
          trafficInitialized.current = true;
          console.log("Traffic layer initialized");
        }
      } catch (error) {
        console.error("Error initializing traffic layer:", error);
        // Try again later
        setTimeout(initTraffic, 500);
      }
    };

    // Start the initialization process when map is available
    if (map.current) {
      map.current.on("load", initTraffic);

      // Also try if the map is already loaded
      if (map.current.loaded()) {
        initTraffic();
      }
    }

    return () => {
      if (map?.current) {
        map.current.off("load", initTraffic);
      }
    };
  }, [map]);

  // Toggle map layers
  const toggleMapLayer = (layer) => {
    if (!map?.current) return;

    const newLayers = { ...mapLayers };
    newLayers[layer] = !newLayers[layer];
    mapLayersRef.current = newLayers;
    setMapLayers(newLayers);

    // Apply layer changes to the map
    if (layer === "satellite") {
      map.current.setStyle(
        newLayers.satellite
          ? "mapbox://styles/mapbox/satellite-streets-v12"
          : darkMode
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/light-v11",
      );

      // Need to re-initialize traffic after style change
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
        // Try to add traffic layer if it doesn't exist
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
            layout: {
              "line-join": "round",
              "line-cap": "round",
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
        } catch (error) {
          console.error("Error adding traffic layer:", error);
        }
      }
    }

    if (layer === "terrain") {
      if (newLayers.terrain) {
        // Add terrain source and layer
        try {
          if (!map.current.getSource("mapbox-dem")) {
            map.current.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.mapbox-terrain-dem-v1",
              tileSize: 512,
              maxzoom: 14,
            });
          }
          // Add terrain exaggeration
          map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        } catch (error) {
          console.error("Error adding terrain:", error);
        }
      } else {
        // Remove terrain
        map.current.setTerrain(null);
      }
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

      {/* Navigation Bar */}
      <NavigationBar map={map} />

      {/* Map Controls & Dark Mode */}
      <div className="fixed bottom-4 right-4 z-10 flex items-center">
        {/* Mobile Dark Mode Toggle */}
        {isMobile && (
          <motion.button
            className={`p-3 rounded-full shadow-lg mr-2 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            {darkMode ? (
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
        )}

        {/* Map Layers Button */}
        <motion.button
          onClick={() => setShowControls(!showControls)}
          className={`p-3 rounded-full shadow-lg ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MapIcon size={20} />
        </motion.button>

        {/* Desktop Dark Mode Toggle - only visible on non-mobile */}
        {!isMobile && (
          <div className="fixed top-4 right-4">
            <DarkModeToggle />
          </div>
        )}

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`absolute bottom-16 right-0 p-3 rounded-lg shadow-lg ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <div className="space-y-2">
                <button
                  onClick={() => toggleMapLayer("traffic")}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded ${
                    mapLayers.traffic
                      ? "bg-blue-500 text-white"
                      : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center">
                    <Layers size={16} className="mr-2" />
                    Tráfico
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full ${
                      mapLayers.traffic ? "bg-white" : "border border-gray-400"
                    }`}
                  ></div>
                </button>

                <button
                  onClick={() => toggleMapLayer("terrain")}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded ${
                    mapLayers.terrain
                      ? "bg-blue-500 text-white"
                      : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center">
                    <Layers size={16} className="mr-2" />
                    Terreno
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full ${
                      mapLayers.terrain ? "bg-white" : "border border-gray-400"
                    }`}
                  ></div>
                </button>

                <button
                  onClick={() => toggleMapLayer("satellite")}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded ${
                    mapLayers.satellite
                      ? "bg-blue-500 text-white"
                      : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center">
                    <Layers size={16} className="mr-2" />
                    Satélite
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full ${
                      mapLayers.satellite
                        ? "bg-white"
                        : "border border-gray-400"
                    }`}
                  ></div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Details Overlay */}
      {selectedEvent && <EventDetails event={selectedEvent} />}
    </motion.div>
  );
}
