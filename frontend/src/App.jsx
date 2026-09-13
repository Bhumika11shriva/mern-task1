import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./ProductCard.css";

const API_URL = "http://localhost:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for adding a new product
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

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

  // CREATE - Add a new product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!name || !price) return;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price), description }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add product");
        return res.json();
      })
      .then((newProduct) => {
        setProducts((prev) => [...prev, newProduct]);
        setName("");
        setPrice("");
        setDescription("");
      })
      .catch((err) => setError(err.message));
  };

  // DELETE - Remove a product
  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete product");
        return res.json();
      })
      .then(() => {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      })
      .catch((err) => setError(err.message));
  };

  // UPDATE - Edit an existing product
  const handleUpdate = (id, updatedData) => {
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update product");
        return res.json();
      })
      .then((updatedProduct) => {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? updatedProduct : p))
        );
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <h1>Product Catalog</h1>
        <p>MERN Stack Internship – Task 1</p>
      </div>

      {/* CREATE FORM */}
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
        <button type="submit">Add Product</button>
      </form>

      {error && <p className="error-text">Error: {error}</p>}

      {/* PRODUCT LIST */}
      {loading ? (
        <p className="status-text">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="status-text">No products found. Add one using the form above.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
