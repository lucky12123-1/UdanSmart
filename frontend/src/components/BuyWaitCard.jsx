import { CalendarDays, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function BuyWaitCard({ data }) {
  if (!data?.has_flights) return null;

  const buy = data.signal === 'BUY' || data.signal === 'BUY_NOW';
  const bestDay = data.best_day_of_week || data.weekly_analysis_90d?.best_day_of_week;
  const analysisDays = data.weekly_analysis_90d?.analysis_period_days || 90;
  const cheapest = data.weekly_analysis_90d?.days?.find((d) => d.is_cheapest);
  const priciest = data.weekly_analysis_90d?.days?.find((d) => d.is_priciest);

  return (
    <article className={clsx('animate-slide-up rounded-2xl border p-6', buy ? 'border-success/40 bg-success/10' : 'border-warning/40 bg-warning/10')}>
      <div className="flex items-center gap-3">
        {buy ? <CheckCircle className="text-success" size={42} /> : <Clock className="text-warning" size={42} />}
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-slate-400">{data.signal}</p>
          <h3 className="text-2xl font-black text-white">{buy ? 'Good time to book' : 'Consider waiting'}</h3>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400">
          <CalendarDays size={28} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Best day of the week</p>
          <p className="text-4xl font-black text-white">{bestDay || '—'}</p>
          <p className="mt-1 text-sm text-slate-400">From {analysisDays}-day route analysis</p>
        </div>
      </div>

      {cheapest && priciest && cheapest.day_name !== priciest.day_name && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-xs text-slate-400">Cheapest weekday</p>
            <p className="font-black text-success">{cheapest.day_name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {cheapest.pct_vs_route_avg <= 0 ? '' : '+'}
              {cheapest.pct_vs_route_avg}% vs route average
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-xs text-slate-400">Priciest weekday</p>
            <p className="font-black text-danger">{priciest.day_name}</p>
            <p className="mt-1 text-xs text-slate-500">
              +{priciest.pct_vs_route_avg}% vs route average
            </p>
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-bold text-slate-300">
          <span>Confidence</span>
          <span>{Math.round((data.confidence || 0) * 100)}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/10">
          <div
            className={clsx('h-3 rounded-full transition-all duration-700', buy ? 'bg-success' : 'bg-warning')}
            style={{ width: `${Math.round((data.confidence || 0) * 100)}%` }}
          />
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-300">{data.reasoning}</p>
    </article>
  );
}
