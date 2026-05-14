import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { formatDate, formatINR } from '../utils/formatters';

const tone = { cheap: 'bg-success/10 text-success', moderate: 'bg-warning/10 text-warning', expensive: 'bg-danger/10 text-danger', festive_peak: 'bg-saffron/10 text-saffron' };

export default function PriceTable({ days = [], onBook }) {
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' });
  const [page, setPage] = useState(0);
  const sorted = useMemo(() => [...days].sort((a, b) => {
    const av = sort.key === 'date' ? new Date(a.date).getTime() : a[sort.key];
    const bv = sort.key === 'date' ? new Date(b.date).getTime() : b[sort.key];
    return sort.dir === 'asc' ? av > bv ? 1 : -1 : av < bv ? 1 : -1;
  }), [days, sort]);
  const pageSize = 14;
  const visible = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const avg = days.length ? days.reduce((sum, item) => sum + item.price, 0) / days.length : 0;
  function header(key, label) { return <button type="button" onClick={() => setSort((current) => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }))} className="font-black text-slate-300">{label} {sort.key === key ? sort.dir === 'asc' ? '↑' : '↓' : '↕'}</button>; }
  if (!days.length) return null;
  return <article className="glass rounded-2xl p-6"><h3 className="text-xl font-black text-white">Fare Table</h3><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs uppercase"><th className="py-3">{header('date','Date')}</th><th>Day</th><th>{header('price','Predicted Price')}</th><th>vs Average</th><th>Label</th><th>Festive?</th><th>Action</th></tr></thead><tbody>{visible.map((day, index) => { const vsAvg = avg ? Math.round((day.price / avg - 1) * 100) : 0; return <tr key={day.date} className={clsx('border-b border-white/5 transition hover:bg-white/5', index % 2 && 'bg-white/[0.02]')}><td className="py-3 font-bold text-white">{formatDate(day.date, { year: 'numeric' })}</td><td className="text-slate-300">{formatDate(day.date, { weekday: 'long' })}</td><td className="font-black text-white">{formatINR(day.price)}</td><td className={vsAvg <= 0 ? 'font-bold text-success' : 'font-bold text-danger'}>{vsAvg > 0 ? '+' : ''}{vsAvg}%</td><td><span className={clsx('rounded-full px-2 py-1 text-xs font-black capitalize', tone[day.price_label])}>{day.price_label.replace('_', ' ')}</span></td><td>{day.holiday_name ? <span className="rounded-full bg-saffron px-2 py-1 text-xs font-black text-navy-900">{day.holiday_name}</span> : <span className="text-slate-500">No</span>}</td><td><button type="button" onClick={() => onBook(day)} className="rounded-full bg-brand-500 px-3 py-2 text-xs font-black text-white hover:bg-brand-600">Book This Date</button></td></tr>; })}</tbody></table></div>{sorted.length > pageSize && <div className="mt-4 flex justify-end gap-2"><button type="button" disabled={page === 0} onClick={() => setPage((v) => Math.max(0, v - 1))} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Prev</button><button type="button" disabled={(page + 1) * pageSize >= sorted.length} onClick={() => setPage((v) => v + 1)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Next</button></div>}</article>;
}
