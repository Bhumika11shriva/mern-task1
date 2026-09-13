import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ProductCard.css";

// Fix default marker icon issue with bundlers like create-react-app
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// A different colored icon to highlight the user's own location
const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "user-marker",
});

// Haversine formula - calculates distance in km between two lat/lng points
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Small helper component to re-center the map when userLocation changes
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [position, map]);
  return null;
}

function MapView({ products }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [sortedProducts, setSortedProducts] = useState([]);

  const productsWithLocation = products.filter(
    (p) => p.location && p.location.lat && p.location.lng
  );

  const defaultCenter = [20.5937, 78.9629]; // Center of India as default view

  const handleFindNearest = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        const withDistance = productsWithLocation
          .map((p) => ({
            ...p,
            distance: getDistanceKm(latitude, longitude, p.location.lat, p.location.lng),
          }))
          .sort((a, b) => a.distance - b.distance);

        setSortedProducts(withDistance);
      },
      () => {
        setLocationError("Could not get your location. Please allow location access.");
      }
    );
  };

  return (
    <div className="map-view-wrapper">
      <div className="map-controls">
        <button className="find-nearest-btn" onClick={handleFindNearest}>
          📍 Find Products Near Me
        </button>
        {locationError && <p className="error-text">{locationError}</p>}
      </div>

      {productsWithLocation.length === 0 ? (
        <p className="status-text">
          No products have location data yet. Add a product with latitude &amp; longitude to see it on the map.
        </p>
      ) : (
        <MapContainer
          center={userLocation || defaultCenter}
          zoom={userLocation ? 12 : 5}
          style={{ height: "450px", width: "100%", borderRadius: "12px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && <RecenterMap position={userLocation} />}

          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>📍 You are here</Popup>
            </Marker>
          )}

          {productsWithLocation.map((product) => (
            <Marker key={product._id} position={[product.location.lat, product.location.lng]}>
              <Popup>
                <strong>{product.name}</strong>
                <br />
                Price: ${product.price}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {sortedProducts.length > 0 && (
        <div className="nearest-list">
          <h3>Nearest Products</h3>
          <ul>
            {sortedProducts.map((p) => (
              <li key={p._id}>
                <strong>{p.name}</strong> — ${p.price} — {p.distance.toFixed(1)} km away
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MapView;
