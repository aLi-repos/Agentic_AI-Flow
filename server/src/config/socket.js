const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    // Join execution room for live streaming
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
      }
    });

    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    // Join user notification room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitExecutionEvent = (executionId, eventName, payload) => {
  if (io && executionId) {
    io.to(`execution:${executionId}`).emit(eventName, payload);
  }
};

const emitUserEvent = (userId, eventName, payload) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent,
  emitUserEvent,
};
