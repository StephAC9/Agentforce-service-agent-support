export default function EventCard({ event }) {
  return (
    <article className="event-card">
      <div className="event-card-header">
        {event.logoUrl && (
          <img
            src={event.logoUrl}
            alt={event.name}
            className="event-logo"
          />
        )}

        <div className="event-header-text">
          <div className="event-tags">
            <span className="tag primary">{event.category}</span>
          </div>
          <h2>{event.name}</h2>
        </div>
      </div>

      <p className="description">{event.description}</p>

      <div className="event-meta">
        <span>📅 {event.startDate} – {event.endDate}</span>
        <span>📍 {event.city}, {event.country}</span>
      </div>

      {event.pageUrl && (
        <a
          href={event.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="event-link"
        >
          View event →
        </a>
      )}
    </article>
  );
}