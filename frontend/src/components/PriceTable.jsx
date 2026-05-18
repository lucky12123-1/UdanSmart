import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { formatDate, formatINR } from '../utils/formatters';

const tone = {
  cheap: 'bg-success/10 text-success',
  moderate: 'bg-warning/10 text-warning',
  expensive: 'bg-danger/10 text-danger',
  festive_peak: 'bg-saffron/10 text-saffron',
};

function dateKey(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getNearbyDays(days, centerDate, windowDays = 3) {
  if (!centerDate || !days?.length) return [];
  const center = new Date(centerDate).getTime();
  const msWindow = windowDays * 86400000;
  return days
    .filter((d) => {
      const t = new Date(d.date).getTime();
      return Math.abs(t - center) <= msWindow;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** Prefer travel-range fares; fill gaps from 90-day trend so labels stay consistent. */
function buildNearbyDays(days, trendDays, centerDate, windowDays = 3) {
  const fromTrend = getNearbyDays(trendDays, centerDate, windowDays);
  const fromDays = getNearbyDays(days, centerDate, windowDays);
  if (!fromDays.length) return fromTrend;
  if (!fromTrend.length) return fromDays;

  const merged = new Map();
  for (const day of fromTrend) merged.set(dateKey(day.date), day);
  for (const day of fromDays) merged.set(dateKey(day.date), day);
  return [...merged.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
}

function cheapestDay(dayList) {
  if (!dayList?.length) return null;
  return dayList.reduce((best, day) => (day.price < best.price ? day : best));
}

export default function PriceTable({ days = [], trendDays = [], recommendedDate, onBook }) {
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' });
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => [...days].sort((a, b) => {
    const av = sort.key === 'date' ? new Date(a.date).getTime() : a[sort.key];
    const bv = sort.key === 'date' ? new Date(b.date).getTime() : b[sort.key];
    return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  }), [days, sort]);

  const pageSize = 14;
  const visible = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const avg = days.length ? days.reduce((sum, item) => sum + item.price, 0) / days.length : 0;

  const nearbyDays = useMemo(
    () => buildNearbyDays(days, trendDays, recommendedDate, 3),
    [days, trendDays, recommendedDate],
  );
  const bestNearby = useMemo(() => cheapestDay(nearbyDays), [nearbyDays]);
  const bestNearbyDate = bestNearby?.date ?? recommendedDate;
  const nearbyAvg = nearbyDays.length ? nearbyDays.reduce((s, d) => s + d.price, 0) / nearbyDays.length : avg;

  function header(key, label) {
    return (
      <button type="button" onClick={() => setSort((c) => ({ key, dir: c.key === key && c.dir === 'asc' ? 'desc' : 'asc' }))} className="font-black text-slate-300">
        {label} {sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
      </button>
    );
  }

  if (!days.length) return null;

  return (
    <div className="flex flex-col gap-6">

      {/* Fix 6: ±3 day nearby price context table */}
      {nearbyDays.length > 0 && (
        <article className="glass rounded-2xl p-6">
          <h3 className="text-xl font-black text-white">📅 Prices Around Your Best Date</h3>
          <p className="mt-1 mb-5 text-sm text-slate-400">
            ±3 days around your search — cheapest fare:{' '}
            <span className="font-bold text-success">
              {formatDate(bestNearbyDate, { weekday: 'long', day: '2-digit', month: 'short' })}
            </span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <th className="py-3">Date</th>
                  <th>Day</th>
                  <th>Price</th>
                  <th>vs Nearby Avg</th>
                  <th>Label</th>
                  <th>Festive?</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nearbyDays.map((day) => {
                  const isCheapest = bestNearby && dateKey(day.date) === dateKey(bestNearby.date);
                  const vsAvg = nearbyAvg ? Math.round((day.price / nearbyAvg - 1) * 100) : 0;
                  const label = day.price_label || (day.price < nearbyAvg * 0.9 ? 'cheap' : day.price > nearbyAvg * 1.1 ? 'expensive' : 'moderate');
                  return (
                    <tr
                      key={day.date}
                      className={clsx(
                        'border-b border-white/5 transition hover:bg-white/5',
                        isCheapest && 'bg-success/10 ring-1 ring-success/40',
                      )}
                    >
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        {formatDate(day.date, { year: 'numeric' })}
                        {isCheapest && <span className="rounded-full bg-success px-2 py-0.5 text-[10px] font-black text-white">CHEAPEST</span>}
                      </td>
                      <td className="text-slate-300">{formatDate(day.date, { weekday: 'long' })}</td>
                      <td className="font-black text-white">{formatINR(day.price)}</td>
                      <td className={vsAvg <= 0 ? 'font-bold text-success' : 'font-bold text-danger'}>{vsAvg > 0 ? '+' : ''}{vsAvg}%</td>
                      <td><span className={clsx('rounded-full px-2 py-1 text-xs font-black capitalize', tone[label])}>{label.replace('_', ' ')}</span></td>
                      <td>{day.holiday_name ? <span className="rounded-full bg-saffron px-2 py-1 text-xs font-black text-navy-900">{day.holiday_name}</span> : <span className="text-slate-500">No</span>}</td>
                      <td><button type="button" onClick={() => onBook(day)} className="rounded-full bg-brand-500 px-3 py-2 text-xs font-black text-white hover:bg-brand-600">Book This Date</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* Full Fare Table */}
      <article className="glass rounded-2xl p-6">
        <h3 className="text-xl font-black text-white">Full Fare Table</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase">
                <th className="py-3">{header('date', 'Date')}</th>
                <th>Day</th>
                <th>{header('price', 'Predicted Price')}</th>
                <th>vs Average</th>
                <th>Label</th>
                <th>Festive?</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((day, index) => {
                const vsAvg = avg ? Math.round((day.price / avg - 1) * 100) : 0;
                return (
                  <tr key={day.date} className={clsx('border-b border-white/5 transition hover:bg-white/5', index % 2 && 'bg-white/[0.02]')}>
                    <td className="py-3 font-bold text-white">{formatDate(day.date, { year: 'numeric' })}</td>
                    <td className="text-slate-300">{formatDate(day.date, { weekday: 'long' })}</td>
                    <td className="font-black text-white">{formatINR(day.price)}</td>
                    <td className={vsAvg <= 0 ? 'font-bold text-success' : 'font-bold text-danger'}>{vsAvg > 0 ? '+' : ''}{vsAvg}%</td>
                    <td><span className={clsx('rounded-full px-2 py-1 text-xs font-black capitalize', tone[day.price_label])}>{day.price_label.replace('_', ' ')}</span></td>
                    <td>{day.holiday_name ? <span className="rounded-full bg-saffron px-2 py-1 text-xs font-black text-navy-900">{day.holiday_name}</span> : <span className="text-slate-500">No</span>}</td>
                    <td><button type="button" onClick={() => onBook(day)} className="rounded-full bg-brand-500 px-3 py-2 text-xs font-black text-white hover:bg-brand-600">Book This Date</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length > pageSize && (
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" disabled={page === 0} onClick={() => setPage((v) => Math.max(0, v - 1))} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Prev</button>
            <button type="button" disabled={(page + 1) * pageSize >= sorted.length} onClick={() => setPage((v) => v + 1)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Next</button>
          </div>
        )}
      </article>
    </div>
  );
}
