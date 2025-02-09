const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
