document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.querySelector("#map");
  const statusElement = document.querySelector("#map-status");
  const localStatus = document.querySelector("#local-earthquake-status");
  const yearElement = document.querySelector("#current-year");
  const locationButton = document.querySelector("#locate-user");

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

  // Create the map
  const map = L.map(mapElement).setView([20, 0], 2);

  // Add the map background
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Run when the user presses "Check my area"
  if (locationButton) {
    locationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        if (statusElement) {
          statusElement.textContent =
            "Location services are not supported by this browser.";
        }

        return;
      }

      locationButton.textContent = "Finding your area...";
      locationButton.disabled = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Move the map to the user's approximate location
          map.setView([latitude, longitude], 7);

          // Add a marker for the user's location
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: "#17324d",
            weight: 3,
            fillColor: "#f3c95c",
            fillOpacity: 1
          })
            .bindPopup("Your approximate location")
            .addTo(map)
            .openPopup();

          locationButton.textContent = "Showing my area";

          if (statusElement) {
            statusElement.textContent =
              "The map is now centered near your location.";
          }

          if (localStatus) {
            localStatus.textContent =
              "Checking for earthquakes within 250 km of your area...";
          }

          // Create a date representing 30 days ago
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);

          // Request earthquakes near the user's location
          const localEarthquakeURL =
            "https://earthquake.usgs.gov/fdsnws/event/1/query" +
            "?format=geojson" +
            `&starttime=${startDate.toISOString()}` +
            `&latitude=${latitude}` +
            `&longitude=${longitude}` +
            "&maxradiuskm=250" +
            "&minmagnitude=1" +
            "&orderby=magnitude";

          try {
            const response = await fetch(localEarthquakeURL);

            if (!response.ok) {
              throw new Error("The earthquake request failed.");
            }

            const data = await response.json();
            const earthquakes = data.features;

            if (earthquakes.length === 0) {
              if (localStatus) {
                localStatus.textContent =
                  "No earthquakes of magnitude 1 or greater were reported within 250 km of your area during the past 30 days.";
              }
            } else {
              // Because the results are ordered by magnitude,
              // the first earthquake is the strongest one.
              const strongestEarthquake = earthquakes[0];
              const strongestMagnitude =
                strongestEarthquake.properties.mag;
              const strongestLocation =
                strongestEarthquake.properties.place;

              if (earthquakes.length === 1) {
                if (localStatus) {
                  localStatus.textContent =
                    `1 earthquake was reported within 250 km of your area ` +
                    `during the past 30 days. It had a magnitude of ` +
                    `${strongestMagnitude} near ${strongestLocation}.`;
                }
              } else {
                if (localStatus) {
                  localStatus.textContent =
                    `${earthquakes.length} earthquakes were reported within ` +
                    `250 km of your area during the past 30 days. The strongest ` +
                    `had a magnitude of ${strongestMagnitude} near ` +
                    `${strongestLocation}.`;
                }
              }

              // Add nearby earthquakes to the map
              earthquakes.forEach((earthquake) => {
                const coordinates = earthquake.geometry.coordinates;
                const properties = earthquake.properties;

                const earthquakeLongitude = coordinates[0];
                const earthquakeLatitude = coordinates[1];

                L.circleMarker(
                  [earthquakeLatitude, earthquakeLongitude],
                  {
                    radius: Math.max(5, properties.mag * 2),
                    color: "#17324d",
                    weight: 2,
                    fillColor: "#df7655",
                    fillOpacity: 0.85
                  }
                )
                  .bindPopup(
                    `<strong>Magnitude ${properties.mag}</strong><br>` +
                    `${properties.place}`
                  )
                  .addTo(map);
              });
            }
          } catch (error) {
            console.error(error);

            if (localStatus) {
              localStatus.textContent =
                "Local earthquake information could not be checked right now. Please try again later.";
            }
          }
        },

        () => {
          if (statusElement) {
            statusElement.textContent =
              "Your location could not be accessed. You can still move the map manually.";
          }

          if (localStatus) {
            localStatus.textContent =
              "Allow location access to check for earthquakes near your area.";
          }

          locationButton.textContent = "Check my area";
          locationButton.disabled = false;
        }
      );
    });
  }
});