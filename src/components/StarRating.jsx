export function StarsDisplay({ value, sizeClass = '' }) {
  const v = Math.min(5, Math.max(0, Number(value) || 0));
  const full = Math.round(v);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <i
        key={i}
        className={`${i < full ? 'ph ph-star-fill vendor-star vendor-star--fill' : 'ph ph-star vendor-star'} ${sizeClass}`}
        aria-hidden
      />
    );
  }
  return <span className="vendor-stars-display">{stars}</span>;
}

export function StarsInput({ value, onChange }) {
  const v = Math.min(5, Math.max(1, Number(value) || 5));
  return (
    <div className="vendor-stars-input" role="group" aria-label="Baholash">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`vendor-star-btn ${n <= v ? 'is-active' : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n} yulduz`}
        >
          <i className={n <= v ? 'ph ph-star-fill' : 'ph ph-star'} aria-hidden />
        </button>
      ))}
    </div>
  );
}
