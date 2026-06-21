type Props = {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  badge?: 'soon' | 'beta';
};

export default function OrgComingSoon({ id, icon, title, description, features, badge = 'soon' }: Props) {
  return (
    <section id={id} className="bg-surface rounded-2xl border-2 border-dashed border-white/10 p-6 mb-4">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-extrabold text-primary">{title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              badge === 'beta' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {badge === 'beta' ? 'تجريبي' : 'قريباً'}
            </span>
          </div>
          <p className="text-ink-muted text-sm mb-3 leading-relaxed">{description}</p>
          <ul className="text-sm text-ink-muted grid sm:grid-cols-2 gap-1">
            {features.map(f => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
