// Server
const express = require("express");
const http = require("http");

// Socket
const socketIo = require("socket.io");

// Routes
const index = require("./routes/index");

const app = express();
const server = http.createServer(app);

const io = socketIo(server);

app.use(index);
app.set('socketio', io);

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.shutdown = function () {
    // clean up your resources and exit 
  process.exit();
};


module.exports = { app, io }