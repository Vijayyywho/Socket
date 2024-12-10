import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

// Setup server
const server = http.createServer(app);

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Use the correct frontend URL for production or localhost for dev
  },
});

// Array to keep track of online users
let onlineUser = [];

// Helper function to add a user
const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUser.push({ userId, socketId });
    io.emit("updateUserList", onlineUser); // Notify all users about the new online user
  }
  console.log(onlineUser);
};

// Helper function to remove a user
const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
  io.emit("updateUserList", onlineUser); // Notify all users about the removed user
  console.log(onlineUser);
};

// Helper function to get a user by userId
const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

// Connection event
io.on("connection", (socket) => {
  console.log("Connection successful!");

  // Event when a new user connects
  socket.on("newUser", (userId) => {
    console.log("New User added!");
    addUser(userId, socket.id);
  });

  // Event to handle sending messages
  socket.on("sendMessage", ({ receiverId, data }) => {
    console.log("Message Sent!");
    const receiver = getUser(receiverId);
    if (receiver) {
      console.log("Connection successful!");
      io.to(receiver.socketId).emit("getMessage", data);
    } else {
      console.log("User is offline");
      // Optionally store the message for later retrieval if the user is offline
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("Connection disconnected!");
    removeUser(socket.id);
  });
});

// Use dynamic port for cloud hosting
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
