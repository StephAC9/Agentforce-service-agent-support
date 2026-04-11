import { useEffect, useState } from "react";
import { connectWebSocket } from "./ws";
import EventList from "./components/EventList";
import "./event-card.css";
import "./overlay.css";

console.log("✅ React overlay loaded");

export default function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    connectWebSocket((data) => {
      if (data.type === "events") {
        setEvents(data.events);

        // ✅ Show overlay when events arrive
        document
          .getElementById("event-overlay-root")
          .classList.add("visible");
      }
    });
  }, []);

  const closeOverlay = () => {
    document
      .getElementById("event-overlay-root")
      .classList.remove("visible");
  };

  return (
    <>
      <header className="event-overlay-header">
        <div>
          <h1>Events</h1>
          <h3>Events that match your criteria</h3>
        </div>

        <button
          className="overlay-close-btn"
          aria-label="Close event panel"
          onClick={closeOverlay}
        >
          ×
        </button>
      </header>

      <EventList events={events} />
    </>
  );
}