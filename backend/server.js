const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Set JWT Secret
if (!process.env.JWT_SECRET) {
    console.warn("Warning: JWT_SECRET not set in environment. Using fallback secret.");
}

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err.message));

// Importing the Search model
const Search = require("./models/Search");

app.get("/", (req, res) => {
    res.send("Server is running...");
});

// Auth Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Route to save a search query
app.post("/api/search", async (req, res) => {
    try {
        const newSearch = new Search(req.body);
        await newSearch.save();
        res.status(201).json(newSearch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to fetch search history
app.get("/api/search", async (req, res) => {
    try {
        const searchHistory = await Search.find().sort({ createdAt: -1 });
        res.json(searchHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Try a different port.`);
        process.exit(1);
    } else {
        console.error("Server error:", err);
    }
});
