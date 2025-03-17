const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const http = require("http");
const { Server } = require("socket.io");

// if /static folder does not exist, create it ,, this is to store images and videos uploaded by users
const staticDir = path.join(__dirname, "../static");
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir);
}

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/properties', require('./routes/property.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/static', express.static('static'));
app.use('/api/ratings', require('./routes/rating.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/contracts', require('./routes/contract.routes'));

// Default route
app.get("/", (req, res) => {
  res.send("RaumMate API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// setting up a real-time communication system
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // Allow your Angular app to connect
    methods: ["GET", "POST"],
  },
});

// Define a schema for messages
const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
});

const Message = mongoose.model("Message", messageSchema);

// Store active users and their socket IDs
const users = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for a new user joining the chat
  socket.on("join", (userId) => {
    users[userId] = socket.id; // Map user ID to socket ID
    console.log(`User ${userId} joined with socket ID ${socket.id}`);
  });

  // Listen for messages
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, message } = data;

    // Save the message to the database
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();

    // Emit the message to the receiver
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
        _id: newMessage._id, // Include message ID for tracking
      });

      // Mark the message as delivered
      newMessage.delivered = true;
      await newMessage.save();
    }
  });

  // Listen for message read events
  socket.on("markAsRead", async (messageId) => {
    const message = await Message.findById(messageId);
    if (message) {
      message.read = true;
      await message.save();

      // Notify the sender that the message was read
      const senderSocketId = users[message.senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", messageId);
      }
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    // Remove user from the active users list
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
