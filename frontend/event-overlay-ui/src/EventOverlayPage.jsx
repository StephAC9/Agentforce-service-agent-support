import EventCard from "./EventCard";
import "./events.css";

export default function EventOverlayPage({ events }) {
  return (
    <div>
      <header className="events-header">
        <div className="icon">🛡️</div>
        <div>
          <h1>Cybersecurity Events</h1>
          <p>Upcoming events and training sessions</p>
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
