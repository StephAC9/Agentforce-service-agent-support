import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

window.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("event-overlay-root");

  if (!root) {
    console.error("❌ event-overlay-root not found in DOM");
    return;
  }

  console.log("✅ event-overlay-root found, mounting React overlay");

  ReactDOM.createRoot(root).render(<App />);
});