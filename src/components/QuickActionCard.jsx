export default function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <button className="quick-action-card" onClick={onClick}>
      <div className="quick-action-card__header">
        <p className="quick-action-card__title">{title}</p>
        <div className="quick-action-card__icon">{icon}</div>
      </div>
      <p className="quick-action-card__description">{description}</p>
    </button>
  )
}
