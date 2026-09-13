import React, { useState } from "react";
import "./ProductCard.css";

const API_URL = "http://localhost:5000/api/products";

function ProductCard({ product, onDelete, onUpdate, onReviewAdded, isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [description, setDescription] = useState(product.description || "");

  const [showReviews, setShowReviews] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const handleSave = () => {
    onUpdate(product._id, { name, price: Number(price), description });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description || "");
    setIsEditing(false);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewName || !comment) return;

    fetch(`${API_URL}/${product._id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: reviewName, rating: Number(rating), comment }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add review");
        return res.json();
      })
      .then((updatedProduct) => {
        onReviewAdded(updatedProduct);
        setReviewName("");
        setComment("");
        setRating(5);
        setReviewError("");
      })
      .catch((err) => setReviewError(err.message));
  };

  if (isEditing) {
    return (
      <div className="card">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <div className="card-actions">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p className="price">Price: ${product.price}</p>
      {product.description && <p className="description">{product.description}</p>}

      {avgRating && (
        <p className="rating">⭐ {avgRating} ({product.reviews.length} review{product.reviews.length > 1 ? "s" : ""})</p>
      )}

      {isAdmin && (
        <div className="card-actions">
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
          <button className="delete-btn" onClick={() => onDelete(product._id)}>Delete</button>
        </div>
      )}

      <button className="toggle-reviews-btn" onClick={() => setShowReviews(!showReviews)}>
        {showReviews ? "Hide Reviews" : "View Reviews"}
      </button>

      {showReviews && (
        <div className="reviews-section">
          {product.reviews && product.reviews.length > 0 ? (
            <ul className="reviews-list">
              {product.reviews.map((r, idx) => (
                <li key={idx}>
                  <strong>{r.name}</strong> — ⭐{r.rating}
                  <p>{r.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-reviews">No reviews yet. Be the first!</p>
          )}

          <form className="review-form" onSubmit={handleAddReview}>
            <input
              type="text"
              placeholder="Your name"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              required
            />
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={3}>⭐⭐⭐ (3)</option>
              <option value={2}>⭐⭐ (2)</option>
              <option value={1}>⭐ (1)</option>
            </select>
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit">Submit Review</button>
            {reviewError && <p className="error-text">{reviewError}</p>}
          </form>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
