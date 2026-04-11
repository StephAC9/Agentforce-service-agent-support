import EventCard from "./EventCard";
import "../styles/event-card.css";

export default function EventList({ events }) {
  if (!events || events.length === 0) {
    return <p className="event-empty">No events yet.</p>;
  }

  return (
    <div className="event-list">
      {events.map((event, idx) => (
        <EventCard key={idx} event={event} />
      ))}
    </div>
  );
}