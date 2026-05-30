// EventCard — background image com overlay escuro, igual ao Flutter EventCard atualizado
export default function EventCard({ id, title, date, type, imageUrl, onClick }) {
  function fmt(iso) {
    if (!iso) return ''
    // "2025-09-08T00:00:00" or "2025-09-08"
    return iso.split('T')[0].split('-').reverse().join('/')
  }

  return (
    <div
      className="event-card event-card-img"
      id={`event-card-${id}`}
      style={{ backgroundImage: `url(${imageUrl ?? 'https://picsum.photos/600/300'})` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <div className="event-card-overlay">
        <span className="event-card-badge">{type}</span>
        <div className="event-card-spacer" />
        <p className="event-card-title-white">{title}</p>
        <div className="event-card-footer">
          <span className="event-card-date-white">{fmt(date)}</span>
          <span className="event-card-arrow-white">›</span>
        </div>
      </div>
    </div>
  )
}
