import "../styles/event-card.css";

// ---------- Helpers ----------

function toZonedDate(date, timeZone) {
  if (!date) return null;
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone })
  );
}

function formatEventDate(startDate, endDate, timeZone) {
  if (!startDate && !endDate) return null;

  const format = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const start = startDate ? toZonedDate(startDate, timeZone) : null;
  const end = endDate ? toZonedDate(endDate, timeZone) : start;

  if (start && end) {
    const sameDate =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();

    return sameDate
      ? format(start)
      : `${format(start)} — ${format(end)}`;
  }

  return format(start || end);
}

function formatEventTime(startDate, endDate, timeZone) {
  if (!startDate && !endDate) return null;

  const start = startDate ? toZonedDate(startDate, timeZone) : null;
  const end = endDate ? toZonedDate(endDate, timeZone) : start;

  const hasTime = (date) =>
    date && !(date.getHours() === 0 && date.getMinutes() === 0);

  const format = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  if (start && end && hasTime(start) && hasTime(end)) {
    const sameDate =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();

    if (!sameDate) return null;

    return start.getTime() === end.getTime()
      ? format(start)
      : `${format(start)} – ${format(end)}`;
  }

  if (hasTime(start)) return format(start);
  if (hasTime(end)) return format(end);

  return null;
}

function getEventStatus(startDate, endDate, timeZone) {
  if (!startDate && !endDate) return null;

  const now = toZonedDate(new Date(), timeZone);
  const start = startDate ? toZonedDate(startDate, timeZone) : null;
  const end = endDate ? toZonedDate(endDate, timeZone) : start;

  if (start && now < start) return "Upcoming";
  if (start && end && now >= start && now <= end) return "Ongoing";
  if (end && now > end) return "Past";

  return null;
}

function getRelativeCountdown(startDate, timeZone) {
  if (!startDate) return null;

  const now = toZonedDate(new Date(), timeZone);
  const start = toZonedDate(startDate, timeZone);

  if (now >= start) return null;

  const diffMs = start - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return null;
  if (days === 1) return "Starts tomorrow";

  return `Starts in ${days} days`;
}

// ---------- Component ----------

export default function EventCard({ event }) {
  //const timeZone = event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const DEFAULT_TIMEZONE = "Europe/Paris";
  const timeZone = event.timeZone ?? DEFAULT_TIMEZONE;

  const dateText = formatEventDate(event.startDate, event.endDate, timeZone);
  const timeText = formatEventTime(event.startDate, event.endDate, timeZone);
  const status = getEventStatus(event.startDate, event.endDate, timeZone);
  const countdown = getRelativeCountdown(event.startDate, timeZone);

  return (
    <article
      className={`event-card ${status === "Past" ? "event-card-past" : ""}`}
    >
      <div className="event-card-header">
        <div className="event-title-row">
          {event.logoUrl && (
            <img
              src={event.logoUrl}
              alt={event.name}
              className="event-logo"
            />
          )}
          <h3 className="event-title">{event.name}</h3>
        </div>

        <div className="event-badges">
          {event.category && (
            <span className="badge badge-category">{event.category}</span>
          )}

          {status && (
            <span className={`badge badge-status badge-${status.toLowerCase()}`}>
              {status}
            </span>
          )}

          {countdown && (
            <span className="badge badge-countdown">
              {countdown}
            </span>
          )}
        </div>
      </div>

      {event.description && (
        <p className="event-description">{event.description}</p>
      )}

      <div className="event-meta">
        {dateText && (
          <div className="meta-row">
            <span className="meta-icon">📅</span>
            <span>{dateText}</span>
          </div>
        )}

        {timeText && (
          <div className="meta-row">
            <span className="meta-icon">⏰</span>
            <span>{timeText}</span>
          </div>
        )}

        {event.location && (
          <div className="meta-row">
            <span className="meta-icon">📍</span>
            <span>{event.location}</span>
          </div>
        )}

        {event.attendees && (
          <div className="meta-row">
            <span className="meta-icon">👥</span>
            <span>{event.attendees} attendees</span>
          </div>
        )}
      </div>
    </article>
  );
}
