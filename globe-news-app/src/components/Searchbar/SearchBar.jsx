import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import mapboxgl from "mapbox-gl";

export default function SearchBar({ map }) {
  const { darkMode } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowDropdown(true);

    try {
      // Using Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=mx&limit=5`,
      );

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("Error searching locations:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection
  const handleSelectLocation = (location) => {
    if (!map.current) return;

    map.current.flyTo({
      center: location.center,
      zoom: 10,
      essential: true,
      duration: 2000,
    });

    setShowDropdown(false);
    setSearchQuery(location.place_name);
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!map.current) return;

    setIsLocating(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get location name
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`,
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.features && data.features.length > 0) {
                setSearchQuery(data.features[0].place_name);
              }
            })
            .catch((error) =>
              console.error("Error getting location name:", error),
            );

          // Fly to user location
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 10,
            essential: true,
            duration: 2000,
          });

          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          alert(
            "Unable to retrieve your location. Please check your browser permissions.",
          );
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  return (
    <div
      ref={searchContainerRef}
      className={`fixed z-30 top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4`}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        className={`relative rounded-lg shadow-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center">
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for a location in Mexico..."
            className={`flex-grow px-4 py-3 rounded-l-lg outline-none ${
              darkMode
                ? "bg-gray-800 text-white placeholder-gray-400"
                : "bg-white text-gray-800 placeholder-gray-500"
            }`}
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={`px-4 py-3 transition-colors ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            {isSearching ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>

          {/* Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className={`px-4 py-3 rounded-r-lg transition-colors ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            title="Use your current location"
          >
            {isLocating ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectLocation(result)}
                className={`px-4 py-3 cursor-pointer ${
                  darkMode
                    ? "hover:bg-gray-700 border-b border-gray-700 text-white"
                    : "hover:bg-gray-100 border-b border-gray-100 text-gray-800"
                }`}
              >
                <div className="font-medium">{result.text}</div>
                <div
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {result.place_name}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
