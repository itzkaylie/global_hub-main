document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.querySelector("#map");
  const statusElement = document.querySelector("#map-status");
  const yearElement = document.querySelector("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  if (!mapElement || typeof L === "undefined") {
    if (statusElement) {
      statusElement.textContent =
        "The earthquake map could not be loaded.";
    }

    return;
  }

  const map = L.map(mapElement).setView([20, 0], 2);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }
  ).addTo(map);

  const earthquakeURL =
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

  fetch(earthquakeURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error("The earthquake feed is unavailable.");
      }

      return response.json();
    })
    .then((data) => {
      data.features.forEach((earthquake) => {
        const coordinates =
          earthquake.geometry.coordinates;

        const longitude = coordinates[0];
        const latitude = coordinates[1];

        const magnitude =
          earthquake.properties.mag;

        const location =
          earthquake.properties.place ||
          "Unknown location";

        L.circleMarker([latitude, longitude], {
          radius: Math.max(6, magnitude * 1.5),
          color: "#9f2020",
          weight: 1,
          fillColor: "#ef4444",
          fillOpacity: 0.7
        })
          .bindPopup(`
            <strong>${location}</strong>
            <br>
            Magnitude: ${magnitude}
          `)
          .addTo(map);
      });

      statusElement.textContent =
        `${data.features.length} earthquakes shown ` +
        "from the past 30 days.";
    })
    .catch((error) => {
      console.error(
        "Error fetching earthquake data:",
        error
      );

      statusElement.textContent =
        "Live earthquake data is temporarily unavailable.";
    });
});