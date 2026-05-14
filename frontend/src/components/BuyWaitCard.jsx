import { CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { formatDate, formatINR } from '../utils/formatters';

export default function BuyWaitCard({ data }) {
  if (!data?.has_flights) return null;
  const buy = data.signal === 'BUY' || data.signal === 'BUY_NOW';
  const savings = data.route_average_price ? Math.max(0, Math.round((1 - data.predicted_price / data.route_average_price) * 100)) : 0;
  return <article className={clsx('animate-slide-up rounded-2xl border p-6', buy ? 'border-success/40 bg-success/10' : 'border-warning/40 bg-warning/10')}>
    <div className="flex items-center gap-3">{buy ? <CheckCircle className="text-success" size={42}/> : <Clock className="text-warning" size={42}/>}<div><p className="text-sm font-black uppercase tracking-normal text-slate-400">{data.signal}</p><h3 className="text-2xl font-black text-white">{buy ? 'Book this fare' : 'Wait for a dip'}</h3></div></div>
    <p className="mt-5 text-sm font-bold text-slate-300">Potential savings</p><p className="text-4xl font-black text-white">{savings}%</p>
    <p className="mt-4 text-5xl font-black text-white">{formatINR(data.predicted_price)}</p><p className="mt-2 text-sm text-slate-400 line-through">Route avg {formatINR(data.route_average_price)}</p>
    <div className="mt-5"><div className="mb-2 flex justify-between text-xs font-bold text-slate-300"><span>Confidence</span><span>{Math.round((data.confidence || 0) * 100)}%</span></div><div className="h-3 rounded-full bg-white/10"><div className={clsx('h-3 rounded-full transition-all duration-700', buy ? 'bg-success' : 'bg-warning')} style={{ width: Math.round((data.confidence || 0) * 100) + '%' }} /></div></div>
    <p className="mt-5 text-sm leading-6 text-slate-300">{data.reasoning}</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-slate-400">Best Travel Day</p><p className="font-black text-white">{formatDate(data.recommended_date, { weekday: 'short' })}</p></div><div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-slate-400">Best Booking Day</p><p className="font-black text-white">Today</p></div></div>
  </article>;
}
