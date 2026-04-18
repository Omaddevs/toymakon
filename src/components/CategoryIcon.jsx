/** Kategoriya ikonkasi (Phosphor) */
export default function CategoryIcon({ category }) {
  if (!category) return null;
  return <i className={`ph ${category.icon}`}></i>;
}
