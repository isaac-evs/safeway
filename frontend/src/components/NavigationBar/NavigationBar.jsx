// src/components/NavigationBar/NavigationBar.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import {
  MapPin,
  Navigation,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import mapboxgl from "mapbox-gl";

// Mapbox Directions API (using the same token from your useMapbox hook)
const mapboxDirectionsAPI =
  "https://api.mapbox.com/directions/v5/mapbox/driving";
const ACCESS_TOKEN =
  "pk.eyJ1IjoiaXNhYWMtZXZzIiwiYSI6ImNtOHdoYmp4ZzBmZ2cyd3B3MHRyNHBwaGgifQ.ZQmJFPKar79ixUxSsLpV1g";

export default function NavigationBar({ map }) {
  const { darkMode, events } = useAppContext();
  const [destination, setDestination] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [route, setRoute] = useState(null);
  const [nearbyMarkers, setNearbyMarkers] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const routeRef = useRef(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);

          // If map is available, fly to user location
          if (map && map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 12,
              essential: true,
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setErrorMessage(
            "Unable to get your location. Please enable location services.",
          );
        },
      );
    } else {
      setErrorMessage("Geolocation is not supported by your browser.");
    }
  }, [map]);

  // Calculate nearby markers when route changes
  useEffect(() => {
    if (!route || !events || events.length === 0) return;

    // Calculate markers within 15km of route
    const nearby = events.filter((event) => {
      if (!event.coordinates) return false;

      // Check if marker is within 15km of any point on the route
      return isMarkerNearRoute(event.coordinates, route, 15);
    });

    setNearbyMarkers(nearby);
  }, [route, events]);

  // Helper function to check if marker is near the route
  const isMarkerNearRoute = (markerCoords, routeCoords, maxDistanceKm) => {
    // For each point in the route, check if marker is within maxDistanceKm
    for (const coordPair of routeCoords) {
      const distance = getDistanceFromLatLonInKm(
        markerCoords[1],
        markerCoords[0],
        coordPair[1],
        coordPair[0],
      );

      if (distance <= maxDistanceKm) {
        return true;
      }
    }
    return false;
  };

  // Calculate distance between two points (haversine formula)
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Handle route calculation
  const calculateRoute = async () => {
    if (!userLocation || !destination || !map || !map.current) {
      setErrorMessage("Please provide both origin and destination");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // First, geocode the destination to get coordinates
      const geocodeResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${ACCESS_TOKEN}`,
      );

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.features || geocodeData.features.length === 0) {
        throw new Error("Destination not found");
      }

      const destinationCoords = geocodeData.features[0].center;

      // Get route from Mapbox Directions API
      const response = await fetch(
        `${mapboxDirectionsAPI}/${userLocation[0]},${userLocation[1]};${destinationCoords[0]},${destinationCoords[1]}?steps=true&geometries=geojson&access_token=${ACCESS_TOKEN}`,
      );

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      const routeGeometry = data.routes[0].geometry;
      const routeCoordinates = routeGeometry.coordinates;

      // Store route data
      setRoute(routeCoordinates);
      setIsNavigating(true);

      // Add route to map
      if (map.current) {
        // Remove existing route if any
        if (map.current.getSource("route")) {
          map.current.removeLayer("route-line");
          map.current.removeSource("route");
        }

        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: routeGeometry,
          },
        });

        map.current.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": darkMode ? "#4ade80" : "#10b981",
            "line-width": 6,
            "line-opacity": 0.8,
          },
        });

        // Fit map to show the entire route
        const bounds = new mapboxgl.LngLatBounds();

        // Include origin, destination and all route points
        bounds.extend(userLocation);
        bounds.extend(destinationCoords);
        routeCoordinates.forEach((coord) => bounds.extend(coord));

        map.current.fitBounds(bounds, {
          padding: 80,
          duration: 1000,
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      setErrorMessage(error.message || "Failed to calculate route");
      setIsNavigating(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear navigation and remove route from map
  const clearNavigation = () => {
    setIsNavigating(false);
    setRoute(null);
    setNearbyMarkers([]);
    setDestination("");

    // Remove route from map
    if (map && map.current) {
      if (map.current.getSource("route")) {
        map.current.removeLayer("route-line");
        map.current.removeSource("route");
      }

      // Return to user location
      if (userLocation) {
        map.current.flyTo({
          center: userLocation,
          zoom: 12,
          essential: true,
        });
      }
    }
  };

  // Handle destination input change
  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    calculateRoute();
  };

  // Get marker type count by type
  const getMarkerCountByType = (type) => {
    return nearbyMarkers.filter((marker) => marker.type === type).length;
  };

  return (
    <motion.div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-10 ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      } rounded-lg shadow-lg overflow-hidden transition-all duration-300 w-full max-w-md`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
    >
      {/* Main navigation bar */}
      <div className="px-4 py-3">
        {isNavigating ? (
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Navigation className="mr-2 text-blue-500" size={20} />
                <span className="font-semibold">{destination}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {isExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                <button
                  onClick={clearNavigation}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Route summary - expanded view */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="text-sm space-y-2">
                    <p>
                      <span className="font-medium">From:</span> Your location
                    </p>
                    <p>
                      <span className="font-medium">To:</span> {destination}
                    </p>
                    {route && (
                      <p>
                        <span className="font-medium">Distance:</span>{" "}
                        {getRouteDistance(route).toFixed(1)} km
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Markers alert section */}
            {nearbyMarkers.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-3 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <div className="flex items-center mb-1">
                  <AlertTriangle size={16} className="text-yellow-500 mr-1" />
                  <span className="font-medium text-sm">
                    {nearbyMarkers.length} event
                    {nearbyMarkers.length !== 1 ? "s" : ""} detected along your
                    route
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {getMarkerCountByType("crime") > 0 && (
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      {getMarkerCountByType("crime")} crime
                    </span>
                  )}
                  {getMarkerCountByType("hazard") > 0 && (
                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      {getMarkerCountByType("hazard")} hazard
                    </span>
                  )}
                  {getMarkerCountByType("infrastructure") > 0 && (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {getMarkerCountByType("infrastructure")} infrastructure
                    </span>
                  )}
                  {getMarkerCountByType("social") > 0 && (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {getMarkerCountByType("social")} social
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Enter destination..."
                className={`w-full py-2 pl-8 pr-4 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-700 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <MapPin
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !destination}
              className={`ml-2 px-3 py-2 rounded-lg ${
                isLoading || !destination
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white flex items-center transition duration-200`}
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <Navigation size={16} className="mr-1" />
                  <span>Go</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Error message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-red-500 text-sm"
          >
            {errorMessage}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Helper function to calculate the approximate distance of a route in kilometers
function getRouteDistance(routeCoords) {
  let totalDistance = 0;

  for (let i = 0; i < routeCoords.length - 1; i++) {
    const [lon1, lat1] = routeCoords[i];
    const [lon2, lat2] = routeCoords[i + 1];

    // Haversine formula to calculate distance
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    totalDistance += distance;
  }

  return totalDistance;
}
