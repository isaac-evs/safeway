// src/map/Map.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMapbox from "../../hooks/useMapbox";
import { useAppContext } from "../../context/AppContext";
import EventDetails from "../EventDetails/EventDetails";
import NavigationBar from "../NavigationBar/NavigationBar";
import { Layers, AlertTriangle, Info, X, Map as MapIcon } from "lucide-react";

export default function Map() {
  // Get events from context instead of importing mockEvents
  const { darkMode, selectedEvent, events } = useAppContext();
  const [showControls, setShowControls] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    traffic: false,
    terrain: false,
    satellite: false,
  });

  // Pass events from context to useMapbox hook
  const { mapContainer, map } = useMapbox(events);

  // Toggle map layers
  const toggleMapLayer = (layer) => {
    if (!map || !map.current) return;

    const newLayers = { ...mapLayers };
    newLayers[layer] = !newLayers[layer];
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
    }

    if (layer === "traffic" && map.current.getLayer("traffic")) {
      map.current.setLayoutProperty(
        "traffic",
        "visibility",
        newLayers.traffic ? "visible" : "none",
      );
    } else if (
      layer === "traffic" &&
      !map.current.getLayer("traffic") &&
      newLayers.traffic
    ) {
      // Add traffic layer if it doesn't exist
      map.current.addSource("mapbox-traffic", {
        type: "vector",
        url: "mapbox://mapbox.mapbox-traffic-v1",
      });

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
    }

    if (layer === "terrain") {
      if (newLayers.terrain) {
        // Add terrain source and layer
        if (!map.current.getSource("mapbox-dem")) {
          map.current.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
          // Add terrain exaggeration
          map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
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

      {/* Map Controls */}
      <div className="fixed bottom-4 right-4 z-10">
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
                    Traffic
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
                    Terrain
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
                    Satellite
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
