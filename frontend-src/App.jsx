import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Login from "./Login";
import MapView from "./MapView";
import "./ProductCard.css";

const API_URL = "http://localhost:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products"); // "products" | "map"

  // Auth state
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [showLogin, setShowLogin] = useState(false);

  // Add product form state (admin only)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const isAdmin = !!token;

  // READ - Fetch all products
  const fetchProducts = () => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLoginSuccess = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };

  // CREATE - Add a new product (admin only, sends auth token)
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!name || !price) return;

    const body = {
      name,
      price: Number(price),
      description,
    };
    if (lat && lng) {
      body.location = { lat: Number(lat), lng: Number(lng) };
    }

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add product (are you logged in as admin?)");
        return res.json();
      })
      .then((newProduct) => {
        setProducts((prev) => [...prev, newProduct]);
        setName("");
        setPrice("");
        setDescription("");
        setLat("");
        setLng("");
      })
      .catch((err) => setError(err.message));
  };

  // DELETE - Remove a product (admin only)
  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete product");
        return res.json();
      })
      .then(() => {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      })
      .catch((err) => setError(err.message));
  };

  // UPDATE - Edit an existing product (admin only)
  const handleUpdate = (id, updatedData) => {
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update product");
        return res.json();
      })
      .then((updatedProduct) => {
        setProducts((prev) => prev.map((p) => (p._id === id ? updatedProduct : p)));
      })
      .catch((err) => setError(err.message));
  };

  // Called when a review is successfully added to a product
  const handleReviewAdded = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <h1>Product Catalog</h1>
        <p>MERN Stack Internship – Task 1</p>

        <div className="auth-bar">
          {isAdmin ? (
            <>
              <span>Logged in as {username} (Admin)</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button onClick={() => setShowLogin(!showLogin)}>
              {showLogin ? "Close Login" : "Admin Login"}
            </button>
          )}
        </div>
      </div>

      {showLogin && !isAdmin && <Login onLoginSuccess={handleLoginSuccess} />}

      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === "products" ? "tab active" : "tab"}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={activeTab === "map" ? "tab active" : "tab"}
          onClick={() => setActiveTab("map")}
        >
          Map View
        </button>
      </div>

      {activeTab === "products" && (
        <>
          {/* CREATE FORM - only visible to logged-in admin */}
          {isAdmin && (
            <form className="add-form" onSubmit={handleAddProduct}>
              <h2>Add New Product</h2>
              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Latitude (optional, for map)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude (optional, for map)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
              <button type="submit">Add Product</button>
            </form>
          )}

          {error && <p className="error-text">Error: {error}</p>}

          {loading ? (
            <p className="status-text">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="status-text">No products found.</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onReviewAdded={handleReviewAdded}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "map" && <MapView products={products} />}
    </div>
  );
}

export default App;
