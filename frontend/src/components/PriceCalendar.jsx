import clsx from 'clsx';

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function rankLabel(day) {
  if (day.is_cheapest) return 'Cheapest';
  if (day.is_priciest) return 'Priciest';
  if (day.pct_vs_route_avg <= -5) return 'Good';
  if (day.pct_vs_route_avg >= 8) return 'Avoid';
  return 'Average';
}

export default function PriceCalendar({ weeklyAnalysis }) {
  const days = weeklyAnalysis?.days || [];
  const bestDay = weeklyAnalysis?.best_day_of_week;
  const period = weeklyAnalysis?.analysis_period_days || 90;

  if (!days.length) {
    return <div className="glass rounded-2xl p-6 text-slate-300">No day-of-week analysis available.</div>;
  }

  const ordered = [...days].sort((a, b) => {
    const ai = DAY_ORDER.indexOf(a.day_name);
    const bi = DAY_ORDER.indexOf(b.day_name);
    return ai - bi;
  });

  return (
    <article className="glass rounded-2xl p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white">Best Day of Week to Fly</h3>
          <p className="text-sm text-slate-400">
            {bestDay ? (
              <>
                Last {period} days: fly on <span className="font-bold text-success">{bestDay}</span> for the lowest typical fares
              </>
            ) : (
              `Day-of-week analysis from the last ${period} days`
            )}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-success/15 px-2 py-1 text-success">Cheapest</span>
          <span className="rounded-full bg-danger/15 px-2 py-1 text-danger">Priciest</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {ordered.map((d) => {
          const label = rankLabel(d);
          return (
            <div
              key={d.dow}
              className={clsx(
                'relative flex flex-col gap-2 rounded-2xl border p-3 transition hover:scale-[1.02]',
                d.is_cheapest ? 'border-success/60 bg-success/10 ring-2 ring-success/30' :
                d.is_priciest ? 'border-danger/40 bg-danger/10' :
                'border-white/10 bg-white/5'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{d.day_name.slice(0, 3).toUpperCase()}</span>
                {d.is_cheapest && <span className="text-base">⭐</span>}
                {d.is_priciest && <span className="text-xs font-black text-danger">↑</span>}
              </div>
              <p className={clsx('text-sm font-black', d.is_cheapest ? 'text-success' : d.is_priciest ? 'text-danger' : 'text-white')}>
                {d.day_name}
              </p>
              <p className={clsx('text-xs font-bold', d.pct_vs_route_avg < 0 ? 'text-success' : d.pct_vs_route_avg > 0 ? 'text-danger' : 'text-slate-400')}>
                {d.pct_vs_route_avg > 0 ? '+' : ''}{d.pct_vs_route_avg}% vs avg
              </p>
              <span
                className={clsx(
                  'w-fit rounded-full px-2 py-0.5 text-[10px] font-black uppercase',
                  d.is_cheapest ? 'bg-success/20 text-success' :
                  d.is_priciest ? 'bg-danger/20 text-danger' :
                  'bg-white/10 text-slate-400'
                )}
              >
                {label}
              </span>
              <p className="text-[10px] text-slate-500">{d.sample_count} samples</p>
            </div>
          );
        })}
      </div>

      {bestDay && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4">
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-xs font-bold text-slate-400">Recommendation</p>
            <p className="text-base font-black text-white">Prefer {bestDay} departures on this route</p>
          </div>
          <span className="ml-auto rounded-full bg-brand-500 px-3 py-1 text-xs font-black text-white">90-day insight</span>
        </div>
      )}
    </article>
  );
}
