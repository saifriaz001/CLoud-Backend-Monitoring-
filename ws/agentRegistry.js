const agentRegistry = new Map(); // key: socketId, value: { userId, deviceId, socket, lastActive }

export function registerAgent(socket, userId, deviceId) {
  agentRegistry.set(socket.id, {
    userId,
    deviceId,
    socket,
    lastActive: Date.now(),
  });
}

export function unregisterAgent(socketId) {
  agentRegistry.delete(socketId);
}

export function listActiveAgents() {
  return [...agentRegistry.values()].map(agent => ({
    userId: agent.userId,
    deviceId: agent.deviceId,
    socketId: agent.socket.id,
    lastActive: agent.lastActive
  }));
}

export function getAgentSocket(socketId) {
  return agentRegistry.get(socketId)?.socket || null;
}
