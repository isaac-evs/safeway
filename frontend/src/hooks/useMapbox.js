import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppContext } from "../context/AppContext";

// Replace with your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiaXNhYWMtZXZzIiwiYSI6ImNtOHdoYmp4ZzBmZ2cyd3B3MHRyNHBwaGgifQ.ZQmJFPKar79ixUxSsLpV1g";

export default function useMapbox(events) {
  const mapContainer = useRef(null);
  const map = useRef(null); // We'll expose this
  const markers = useRef([]);
  const { darkMode, setSelectedEvent, setEventsLoaded } = useAppContext();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: darkMode
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: [-102.552784, 23.634501], // Centered on Mexico
      zoom: 4,
      projection: "globe",
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      setGlobeAtmosphere();
      const sunAzimuth = (new Date().getHours() / 24) * 360;
      map.current.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [sunAzimuth, 90.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Function to set globe atmosphere
  const setGlobeAtmosphere = () => {
    if (!map.current) return;

    map.current.setFog({
      color: darkMode ? "rgba(16, 16, 30, 0.5)" : "rgba(186, 210, 235, 0.5)",
      "high-color": darkMode
        ? "rgba(36, 92, 223, 0.4)"
        : "rgba(36, 92, 223, 0.4)",
      "horizon-blend": 0.02,
      "space-color": "#000000",
      "star-intensity": darkMode ? 0.8 : 0.6,
    });
  };

  // Handle dark/light mode changes
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(
        darkMode
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
      );

      // Re-add atmosphere when style changes
      map.current.once("style.load", () => {
        setGlobeAtmosphere();

        // Re-add markers after style change
        if (events && events.length > 0) {
          addMarkers();
        }
      });
    }
  }, [darkMode, events]);

  // Get SVG icon path based on event type
  const getEventIcon = (type) => {
    switch (type) {
      case "crime":
        // Shield Alert icon
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m12 8 4 4"/><path d="M12 12v4"/></svg>`;
      case "infrastructure":
        // Building icon
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
      case "hazard":
        // Alert Triangle icon
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
      case "social":
        // Users icon
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
      default:
        // Alert Circle icon
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    }
  };

  // Function to add markers
  const addMarkers = () => {
    if (!map.current || !events) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    events.forEach((event) => {
      // Check if event has valid coordinates
      if (
        !event.coordinates ||
        !Array.isArray(event.coordinates) ||
        event.coordinates.length !== 2
      ) {
        console.warn(
          `Event ${event.id} has invalid coordinates:`,
          event.coordinates,
        );
        return;
      }

      // Create a marker element
      const el = document.createElement("div");
      el.className = "event-marker";
      el.style.width = "36px";
      el.style.height = "36px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = getEventColor(event.type);
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 0 0 rgba(0, 0, 0, 0.2)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";

      // Add pulse animation
      el.style.animation = "pulse 2s infinite";

      // Add the SVG icon directly using innerHTML
      el.innerHTML = getEventIcon(event.type);

      // Create the marker
      const marker = new mapboxgl.Marker({
        element: el,
        // Important: Set `anchor` to improve positioning and reduce jitter
        anchor: "center",
      })
        .setLngLat(event.coordinates)
        .addTo(map.current);

      // Add click event
      el.addEventListener("click", () => {
        setSelectedEvent(event);

        // Fly to marker
        map.current.flyTo({
          center: event.coordinates,
          zoom: 6,
          essential: true,
          duration: 1500,
        });
      });

      markers.current.push(marker);
    });

    // Add pulse animation style
    if (!document.getElementById("marker-animation")) {
      const style = document.createElement("style");
      style.id = "marker-animation";
      style.innerHTML = `
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    setEventsLoaded(true);
  };

  // Add event markers to map
  useEffect(() => {
    if (!mapLoaded || !events || !map.current) return;

    // Add a small delay to ensure map is fully loaded
    const timer = setTimeout(() => {
      addMarkers();
    }, 100);

    return () => clearTimeout(timer);
  }, [events, mapLoaded, setEventsLoaded]);

  return { mapContainer, map };
}

// Helper to get color based on event type
function getEventColor(type) {
  const colors = {
    crime: "#ed7b7b", // A clear red for crime/danger
    infrastructure: "#99c5ff", // A vibrant blue for construction/development
    hazard: "#edde53", // Orange-yellow for warnings/hazards
    social: "#65db8e", // Vibrant green for social/positive events
    default: "#8C8C8C", // Neutral gray for unknown types
  };

  return colors[type] || colors.default;
}
