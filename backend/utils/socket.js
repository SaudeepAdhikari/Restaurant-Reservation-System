let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

export function getSocketServer() {
  return ioInstance;
}

export function emitEvent(eventName, payload, room) {
  if (!ioInstance) return;

  if (room) {
    ioInstance.to(room).emit(eventName, payload);
    return;
  }

  ioInstance.emit(eventName, payload);
}
