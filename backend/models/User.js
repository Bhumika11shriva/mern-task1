const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin", // for this project, anyone registered is treated as admin
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
