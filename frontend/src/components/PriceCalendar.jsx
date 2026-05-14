import clsx from 'clsx';
import { formatDate, formatINR } from '../utils/formatters';

const labelClass = { cheap: 'bg-success/15 border-success/40', moderate: 'bg-warning/15 border-warning/40', expensive: 'bg-danger/15 border-danger/40', festive_peak: 'bg-saffron/20 border-saffron/70' };

export default function PriceCalendar({ days = [], recommendedDate }) {
  if (!days.length) return <div className="glass rounded-2xl p-6 text-slate-300">No calendar data available.</div>;
  return <article className="glass rounded-2xl p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-black text-white">India Price Calendar</h3><p className="text-sm text-slate-400">Holiday-aware fares for your selected range</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-success/15 px-2 py-1 text-success">Cheap</span><span className="rounded-full bg-warning/15 px-2 py-1 text-warning">Moderate</span><span className="rounded-full bg-danger/15 px-2 py-1 text-danger">Expensive</span></div></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{days.map((day) => {
      const recommended = day.date === recommendedDate;
      const title = formatDate(day.date, { weekday: 'long', year: 'numeric' }) + ' · ' + formatINR(day.price) + (day.holiday_name ? ' · ' + day.holiday_name : '');
      return <div key={day.date} title={title} className={clsx('relative min-h-32 rounded-2xl border p-3 transition hover:scale-[1.02]', labelClass[day.price_label], day.is_holiday && 'border-l-4 border-l-saffron', recommended && 'ring-2 ring-brand-400')}>
        <div className="flex justify-between text-xs text-slate-400"><span>{formatDate(day.date, { weekday: 'short' })}</span><span>{day.is_diwali_period ? '🪔' : day.holiday_name?.includes('Holi') ? '🎊' : day.is_holiday ? '🎉' : ''}</span></div><p className="mt-1 text-2xl font-black text-white">{new Date(day.date).getDate()}</p><p className="mt-2 text-lg font-black text-white">{formatINR(day.price)}</p>{recommended && <span className="absolute right-2 top-2 rounded-full bg-brand-500 px-2 py-1 text-xs font-black">⭐</span>}{day.holiday_name && <p className="mt-2 truncate text-xs font-bold text-saffron">{day.holiday_name}</p>}{day.festive_price_last_year && <p className="mt-1 text-xs italic text-slate-400">Last yr: {formatINR(day.festive_price_last_year)}</p>}
      </div>;
    })}</div>
  </article>;
}
