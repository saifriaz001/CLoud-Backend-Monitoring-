import { verifyAccessToken } from '../utils/verifyAccessToken.js';
import crypto from 'crypto';
import {
  registerAgent,
  unregisterAgent,
  listActiveAgents,
  getAgentSocket
} from './agentRegistry.js';

export function handleSocketConnection(socket, request) {
  socket.id = crypto.randomUUID();

  socket.on('message', async (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    if (msg.type === 'auth') {
      const { token, deviceId, isDashboard } = msg;

      const { valid, payload } = verifyAccessToken(token);
      if (!valid) {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        return socket.close();
      }

      if (isDashboard) {
        socket.isDashboard = true;
        socket.userId = payload.userId;
        socket.send(JSON.stringify({ type: 'auth_success', role: 'dashboard' }));
      } else {
        socket.userId = payload.userId;
        socket.deviceId = deviceId;
        registerAgent(socket, payload.userId, deviceId);
        socket.send(JSON.stringify({ type: 'auth_success', role: 'agent' }));
      }
    }

    if (msg.type === 'list_agents' && socket.isDashboard) {
      const agents = listActiveAgents();
      socket.send(JSON.stringify({ type: 'agent_list', agents }));
    }

    if (msg.type === 'watch_agent' && socket.isDashboard) {
      const targetSocket = getAgentSocket(msg.targetSocketId);
      if (targetSocket) {
        targetSocket.send(JSON.stringify({ type: 'start_stream' }));
      }
    }

    if (msg.type === 'screen_frame' && !socket.isDashboard) {
      const { buffer, timestamp } = msg;
      // Broadcast to all dashboards
      request.wss.clients.forEach((client) => {
        if (client.isDashboard && client.readyState === 1) {
          client.send(JSON.stringify({ type: 'screen_frame', buffer, from: socket.userId, timestamp }));
        }
      });
    }
  });

  socket.on('close', () => {
    unregisterAgent(socket.id);
  });
}
