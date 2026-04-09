let socket;

export function connectWebSocket(onMessage) {
  if (socket) return;

  socket = new WebSocket(
    "wss://agentforce-service-agent-support.onrender.com"
  );

  socket.onopen = () => {
    console.log("✅ Connected to Node WebSocket (production)");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("❌ Invalid WS payload", err);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error", err);
  };

  socket.onclose = () => {
    console.warn("⚠️ WebSocket closed");
    socket = null;
  };
}