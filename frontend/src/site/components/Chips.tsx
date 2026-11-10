export function Chips({ items, label }: { items: string[]; label: string }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label={label}>
      {items.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
    </ul>
  );
}
