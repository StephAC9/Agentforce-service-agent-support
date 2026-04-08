import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

/* =====================================================
   App & Server Setup
===================================================== */
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ Node server running on port ${PORT}`);
});

/* =====================================================
   WebSocket Server
===================================================== */
const wss = new WebSocketServer({ server });

/*
  For now (Agentforce UI testing phase):
  - We DO NOT rely on sessionId from Apex
  - We simply broadcast messages to all WS clients
  - This is correct and expected before embedding the agent
*/
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("✅ WebSocket client connected");
  clients.add(ws);

  ws.on("message", (msg) => {
    console.log("📩 WS message received:", msg.toString());
    // Future use: session registration when embedded
  });

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
    clients.delete(ws);
  });
});

/* =====================================================
   Apex Webhook Endpoint
===================================================== */
app.post("/overlay/events", (req, res) => {
  console.log("✅ Payload received from Salesforce:");
  console.log(JSON.stringify(req.body, null, 2));

  /*
    Expected payload shape from Apex:
    {
      "type": "events",
      "events": [ ... ]
    }
  */

  const payload = {
    type: "events",
    events: req.body.events || []
  };

  // Broadcast to all connected WebSocket clients
  for (const ws of clients) {
    try {
      ws.send(JSON.stringify(payload));
    } catch (err) {
      console.error("❌ Failed to send WS message:", err.message);
    }
  }

  res.sendStatus(200);
});

/* =====================================================
   Optional Test Endpoint (Highly Recommended)
===================================================== */
app.post("/test", (req, res) => {
  console.log("🧪 Test endpoint hit:", req.body);

  for (const ws of clients) {
    ws.send(JSON.stringify({
      type: "test",
      message: "Hello from Node /test endpoint"
    }));
  }

  res.status(200).json({ ok: true });
});

/* =====================================================
   Health Check Endpoint
===================================================== */
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    websocketClients: clients.size
  });
});