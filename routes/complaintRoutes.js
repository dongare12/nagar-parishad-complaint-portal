
const express = require("express");
const router = express.Router();
const Complaint = require("../module/cpmldata");

// Register a new complaint
router.post("/", async (req, res) => {
  try {
    const { name, phone, category, location, description } = req.body;

    const complaint = await Complaint.create({
      name,
      phone,
      category,
      location,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully!",
      complaint,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = routes;
