const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// CREATE - Add a new product (admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, price, description, location } = req.body;
    const newProduct = new Product({ name, price, description, location });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Get all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Get a single product by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE - Update a product by ID (admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE - Remove a product by ID (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD REVIEW - Anyone can add a review to a product (public, no login required)
router.post("/:id/reviews", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews.push({ name, rating, comment });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
