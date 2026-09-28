export default function EmptyState({ title, text, action, onAction }) {
  return (
    <div className="empty">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <rect x="6" y="30" width="10" height="20" rx="3" fill="#DDE3EE" />
        <rect x="23" y="18" width="10" height="32" rx="3" fill="#C5CEDF" />
        <rect x="40" y="8" width="10" height="42" rx="3" fill="#AEBBD2" />
      </svg>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="btn btn-primary" onClick={onAction}>{action}</button>
      )}
    </div>
  );
}
