const express = require('express');
const {Server} = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:30001',
      methods:['GET']
    }
  })

// Allow requests from localhost:3001 (your React client)
app.use(cors({ origin: 'http://localhost:3001' ,credentials:true})); // Configure CORS

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendLocation', (data) => {
    io.emit('receiveLocation', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Basic route to check if server is running (optional)
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start the server
const PORT = 1000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
