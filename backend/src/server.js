
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');



const fs = require('fs');
const path = require('path');

// if /static folder does not exist, create it ,, this is to store images and videos uploaded by users
const staticDir = path.join(__dirname, '../static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir);
}


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/properties', require('./routes/property.routes'));
app.use('/api/static', express.static('static'));
app.use('/api/ratings', require('./routes/rating.routes'));

// Default route
app.get("/", (req, res) => {
  res.send("RaumMate API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
