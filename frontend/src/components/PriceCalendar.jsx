import clsx from 'clsx';
import { formatDate, formatINR } from '../utils/formatters';

const labelClass = {
  cheap: 'bg-success/15 border-success/40',
  moderate: 'bg-warning/15 border-warning/40',
  expensive: 'bg-danger/15 border-danger/40',
  festive_peak: 'bg-saffron/20 border-saffron/70',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Fix 3: Always show 7-day-of-week analysis + best day from selected range
function buildWeeklyAnalysis(days) {
  const byDow = {};
  for (const day of days) {
    const dow = new Date(day.date).getDay();
    if (!byDow[dow]) byDow[dow] = { total: 0, count: 0, bestPrice: Infinity, bestDay: null, isFestive: false };
    byDow[dow].total += day.price;
    byDow[dow].count += 1;
    if (day.price < byDow[dow].bestPrice) {
      byDow[dow].bestPrice = day.price;
      byDow[dow].bestDay = day;
    }
    if (day.is_festive_period || day.is_holiday) byDow[dow].isFestive = true;
  }

  const result = DAY_NAMES.map((name, i) => ({
    dow: i,
    name,
    avg: byDow[i] ? Math.round(byDow[i].total / byDow[i].count) : null,
    bestDay: byDow[i]?.bestDay || null,
    isFestive: byDow[i]?.isFestive || false,
  })).filter((d) => d.avg !== null);

  if (!result.length) return result;

  const minAvg = Math.min(...result.map((d) => d.avg));
  const maxAvg = Math.max(...result.map((d) => d.avg));
  const overallAvg = Math.round(result.reduce((s, d) => s + d.avg, 0) / result.length);

  return result.map((d) => ({
    ...d,
    isCheapest: d.avg === minAvg,
    isMostExpensive: d.avg === maxAvg,
    overallAvg,
    pctVsAvg: Math.round(((d.avg - overallAvg) / overallAvg) * 100),
  }));
}

export default function PriceCalendar({ days = [], recommendedDate }) {
  if (!days.length) return <div className="glass rounded-2xl p-6 text-slate-300">No calendar data available.</div>;

  const weekly = buildWeeklyAnalysis(days);
  const cheapest = weekly.find((d) => d.isCheapest);

  return (
    <article className="glass rounded-2xl p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white">Best Day of Week to Fly This Route</h3>
          <p className="text-sm text-slate-400">
            {cheapest ? (
              <>Fly on <span className="font-bold text-success">{cheapest.name}</span> to save the most — avg {formatINR(cheapest.avg)}</>
            ) : 'Day-of-week price analysis for your route'}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-success/15 px-2 py-1 text-success">Cheapest</span>
          <span className="rounded-full bg-danger/15 px-2 py-1 text-danger">Priciest</span>
        </div>
      </div>

      {/* Day-of-week grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {weekly.map((d) => {
          const isAlternate = !d.isCheapest && d.isFestive && cheapest?.isFestive;
          return (
            <div
              key={d.dow}
              className={clsx(
                'relative flex flex-col gap-1 rounded-2xl border p-3 transition hover:scale-[1.02]',
                d.isCheapest ? 'border-success/60 bg-success/10 ring-2 ring-success/30' :
                d.isMostExpensive ? 'border-danger/40 bg-danger/10' :
                'border-white/10 bg-white/5'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{d.name.slice(0, 3).toUpperCase()}</span>
                {d.isCheapest && <span className="text-base">⭐</span>}
                {d.isMostExpensive && <span className="text-xs text-danger font-black">↑</span>}
                {isAlternate && <span className="rounded-full bg-warning/20 px-1 text-[10px] font-black text-warning">ALT</span>}
              </div>
              <p className={clsx('text-base font-black', d.isCheapest ? 'text-success' : d.isMostExpensive ? 'text-danger' : 'text-white')}>
                {formatINR(d.avg)}
              </p>
              <p className={clsx('text-xs font-bold', d.pctVsAvg < 0 ? 'text-success' : d.pctVsAvg > 0 ? 'text-danger' : 'text-slate-400')}>
                {d.pctVsAvg > 0 ? '+' : ''}{d.pctVsAvg}% vs avg
              </p>
              {d.bestDay && (
                <p className="text-[11px] text-slate-500 truncate">
                  Best: {formatDate(d.bestDay.date, { day: '2-digit', month: 'short' })}
                </p>
              )}
              {d.isFestive && <span className="text-[10px] text-saffron font-bold">🎉 Festive</span>}
            </div>
          );
        })}
      </div>

      {/* Best recommended date from selected range */}
      {recommendedDate && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4">
          <span className="text-2xl">📅</span>
          <div>
            <p className="text-xs font-bold text-slate-400">Best date in your selected range</p>
            <p className="text-base font-black text-white">{formatDate(recommendedDate, { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <span className="ml-auto rounded-full bg-brand-500 px-3 py-1 text-xs font-black text-white">⭐ Recommended</span>
        </div>
      )}
    </article>
  );
}
