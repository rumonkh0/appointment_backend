const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

//// Route files
const auth = require("./routes/auth");
const users = require("./routes/users");
const doctors = require("./routes/doctors");
const appointments = require("./routes/appointment");
const reviews = require("./routes/reviews");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/auth", auth);
app.use("/users", users);
app.use("/doctors", doctors);
app.use("/appointments", appointments);
app.use("/reviews", reviews);
app.get("/", (req, res) => {
  res.send("Welcome to Doctor hospital appointment API");
});
// Error middleware
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
