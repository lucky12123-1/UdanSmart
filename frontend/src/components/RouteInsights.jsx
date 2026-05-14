import { Clock } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function RouteInsights({ days = [] }) {
  const byDow = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, index) => {
    const matches = days.filter((day) => (new Date(day.date).getDay() + 6) % 7 === index);
    const avg = matches.length ? matches.reduce((sum, item) => sum + item.price, 0) / matches.length : 0;
    return { label, avg };
  });
  const max = Math.max(...byDow.map((item) => item.avg), 1);
  const priced = byDow.filter((item) => item.avg > 0);
  const minValue = priced.length ? Math.min(...priced.map((item) => item.avg)) : 0;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthTone = ['bg-danger','bg-success','bg-success','bg-warning','bg-warning','bg-success','bg-success','bg-success','bg-warning','bg-danger','bg-danger','bg-danger'];
  return <div className="grid gap-5 lg:grid-cols-3"><article className="glass rounded-2xl p-5"><Clock className="text-brand-400"/><h3 className="mt-3 text-lg font-black text-white">Best Time to Book</h3><p className="mt-2 text-sm leading-6 text-slate-300">Book 3–6 weeks ahead for most India domestic routes. Short-haul routes perform best at 2–4 weeks, medium-haul at 4–6 weeks, and long-haul or festive travel at 6–10 weeks.</p><div className="mt-5 h-3 rounded-full bg-white/10"><div className="h-3 w-2/3 rounded-full bg-gradient-to-r from-success via-brand-500 to-warning" /></div><p className="mt-2 text-xs text-slate-400">Optimal window: 21–45 days</p></article><article className="glass rounded-2xl p-5"><h3 className="text-lg font-black text-white">Day of Week Analysis</h3><div className="mt-5 flex h-36 items-end gap-2">{byDow.map((item) => <div key={item.label} className="flex flex-1 flex-col items-center gap-2"><div className={item.avg === minValue ? 'w-full rounded-t bg-success' : item.avg === max ? 'w-full rounded-t bg-danger' : 'w-full rounded-t bg-brand-500'} style={{ height: Math.max(12, item.avg / max * 120) + 'px' }} title={formatINR(item.avg)} /><span className="text-[10px] text-slate-400">{item.label}</span></div>)}</div><p className="mt-3 text-sm text-slate-300">Tuesday & Wednesday cheapest for domestic India routes.</p></article><article className="glass rounded-2xl p-5"><h3 className="text-lg font-black text-white">India Seasonal Price Index</h3><div className="mt-5 grid grid-cols-6 gap-2">{months.map((month, index) => <span key={month} className={monthTone[index] + ' rounded-full px-2 py-2 text-center text-[11px] font-black text-white ' + (new Date().getMonth() === index ? 'ring-2 ring-white' : '')}>{month}</span>)}</div><p className="mt-4 text-sm text-slate-300">Best: Feb · Peak: Oct-Nov</p><p className="mt-1 text-xs text-slate-400">Based on India domestic historical patterns</p></article></div>;
}
