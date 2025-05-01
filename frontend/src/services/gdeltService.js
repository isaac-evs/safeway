// src/services/gdeltService.js
export async function fetchGdeltEvents() {
  try {
    // Use GDELT's documented GeoJSON events endpoint without a specific query filter
    const response = await fetch(
      `https://api.gdeltproject.org/api/v2/geo/geo?format=geojson&timespan=24h&maxrows=100`,
    );

    const data = await response.json();

    // Check if we received valid GeoJSON
    if (!data || !data.features) {
      console.error("Invalid response from GDELT:", data);
      return [];
    }

    return data.features
      .filter(
        (feature) =>
          feature &&
          feature.geometry &&
          feature.properties &&
          feature.geometry.coordinates &&
          feature.geometry.coordinates.length >= 2,
      )
      .map((feature, index) => {
        const props = feature.properties;

        return {
          id: index + 1,
          title: props.name || "News Event",
          description: props.description || "No description available",
          coordinates: [
            parseFloat(feature.geometry.coordinates[0]),
            parseFloat(feature.geometry.coordinates[1]),
          ],
          type: determineEventType(props.name, props.description),
          date: new Date().toISOString().split("T")[0],
          url: props.url || "#",
          source: extractSource(props.url || "#"),
        };
      });
  } catch (error) {
    console.error("Error fetching GDELT events:", error);
    return [];
  }
}

// Your existing helper functions remain the same

// Your existing helper functions remain the same
function determineEventType(title, description) {
  const text = `${title || ""} ${description || ""}`.toLowerCase();

  if (
    text.includes("climate") ||
    text.includes("environment") ||
    text.includes("pollution")
  )
    return "environment";
  if (
    text.includes("tech") ||
    text.includes("technology") ||
    text.includes("digital")
  )
    return "tech";
  if (
    text.includes("health") ||
    text.includes("disease") ||
    text.includes("medical")
  )
    return "health";
  if (
    text.includes("finance") ||
    text.includes("economy") ||
    text.includes("market")
  )
    return "finance";
  if (
    text.includes("sport") ||
    text.includes("olympic") ||
    text.includes("championship")
  )
    return "sports";
  if (
    text.includes("science") ||
    text.includes("research") ||
    text.includes("discovery")
  )
    return "science";
  if (
    text.includes("art") ||
    text.includes("music") ||
    text.includes("festival") ||
    text.includes("culture")
  )
    return "cultural";
  if (
    text.includes("conflict") ||
    text.includes("military") ||
    text.includes("protest")
  )
    return "conflict";

  return "general";
}

function extractSource(url) {
  if (!url) return "Unknown";
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch (e) {
    return "Unknown";
  }
}
