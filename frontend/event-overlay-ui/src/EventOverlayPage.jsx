import EventCard from "./EventCard";
import "./overlay.css";

export default function EventOverlayPage({ events }) {
  return (
    <div>
      <header className="events-header">
        <div className="icon">🛡️</div>
        <div>
          <h1>Events</h1>
          <h3>Here are the events that match your criteria</h3>
        </div>
      </header>

      <div className="events-list">
        {events.map(e => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
