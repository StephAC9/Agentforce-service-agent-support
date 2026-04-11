import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// ✅ IMPORTANT:
// Because cssCodeSplit = false, importing CSS here
// guarantees it is bundled directly into the JS.
import "./styles/event-card.css";

// --- Find or create the overlay root ---
let rootEl = document.getElementById("event-overlay-root");

if (!rootEl) {
  rootEl = document.createElement("div");
  rootEl.id = "event-overlay-root";
  rootEl.className = "event-overlay";
  document.body.appendChild(rootEl);
}

// --- Ensure overlay is visible ---
rootEl.classList.remove("hidden");

// --- Mount React ---
createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("✅ React Event Overlay loaded");