import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(process.env.PORT || 3001);
const wss = new WebSocketServer({ server });

const clients = new Map(); // sessionId → websocket

// WebSocket connection
wss.on("connection", (ws) => {
  ws.on("message", msg => {
    const { sessionId } = JSON.parse(msg.toString());
    clients.set(sessionId, ws);
  });

  ws.on("close", () => {
    for (const [k, v] of clients.entries()) {
      if (v === ws) clients.delete(k);
    }
  });
});

// Apex webhook endpoint
app.post("/overlay/events", (req, res) => {
  const payload = req.body;
  const client = clients.get(payload.sessionId);

  if (client) {
    client.send(JSON.stringify(payload));
  }

  res.sendStatus(200);
});

console.log("✅ Node WS server running");
