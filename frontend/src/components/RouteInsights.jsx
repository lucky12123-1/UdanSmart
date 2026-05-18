import { Clock } from 'lucide-react';

const JS_DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RouteInsights({ weeklyAnalysis }) {
  const days = weeklyAnalysis?.days || [];
  const byDow = JS_DOW_LABELS.map((label, index) => {
    const match = days.find((day) => day.dow === index);
    return {
      label,
      pct: match?.pct_vs_route_avg ?? 0,
      isCheapest: Boolean(match?.is_cheapest),
      isPriciest: Boolean(match?.is_priciest),
    };
  });
  const priced = byDow.filter((item) => days.length);
  const maxAbs = Math.max(...priced.map((item) => Math.abs(item.pct)), 1);
  const bestDay = weeklyAnalysis?.best_day_of_week;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthTone = ['bg-danger', 'bg-success', 'bg-success', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success', 'bg-success', 'bg-warning', 'bg-danger', 'bg-danger', 'bg-danger'];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <article className="glass rounded-2xl p-5">
        <Clock className="text-brand-400" />
        <h3 className="mt-3 text-lg font-black text-white">Best Time to Book</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Book 3–6 weeks ahead for most India domestic routes. When you travel, prefer{' '}
          {bestDay ? <span className="font-bold text-success">{bestDay}</span> : 'mid-week'} departures based on the last 90 days.
        </p>
        <div className="mt-5 h-3 rounded-full bg-white/10">
          <div className="h-3 w-2/3 rounded-full bg-gradient-to-r from-success via-brand-500 to-warning" />
        </div>
        <p className="mt-2 text-xs text-slate-400">Optimal window: 21–45 days before travel</p>
      </article>

      <article className="glass rounded-2xl p-5">
        <h3 className="text-lg font-black text-white">Day of Week (90 days)</h3>
        <div className="mt-5 flex h-36 items-end gap-2">
          {byDow.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={item.isCheapest ? 'w-full rounded-t bg-success' : item.isPriciest ? 'w-full rounded-t bg-danger' : 'w-full rounded-t bg-brand-500'}
                style={{ height: `${Math.max(12, (Math.abs(item.pct) / maxAbs) * 120)}px` }}
                title={`${item.pct > 0 ? '+' : ''}${item.pct}% vs route avg`}
              />
              <span className="text-[10px] text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-300">
          {bestDay ? `${bestDay} is the cheapest weekday on this route over the last 90 days.` : 'Tuesday & Wednesday are often cheapest for domestic India routes.'}
        </p>
      </article>

      <article className="glass rounded-2xl p-5">
        <h3 className="text-lg font-black text-white">India Seasonal Price Index</h3>
        <div className="mt-5 grid grid-cols-6 gap-2">
          {months.map((month, index) => (
            <span
              key={month}
              className={`${monthTone[index]} rounded-full px-2 py-2 text-center text-[11px] font-black text-white ${new Date().getMonth() === index ? 'ring-2 ring-white' : ''}`}
            >
              {month}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-300">Best: Feb · Peak: Oct–Nov</p>
        <p className="mt-1 text-xs text-slate-400">Based on India domestic historical patterns</p>
      </article>
    </div>
  );
}
