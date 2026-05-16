import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate, formatINR } from '../utils/formatters';

// Fix 5: clamp prices to 65%-145% of route average so chart doesn't look dramatic
function smoothTrend(trend, average) {
  if (!trend?.length || !average) return trend;
  return trend.map((item) => ({
    ...item,
    price: Math.round(Math.max(average * 0.65, Math.min(average * 1.45, item.price))),
  }));
}

export default function PriceTrendChart({ trend = [], average, festiveAverage }) {
  if (!trend?.length) return <div className="glass rounded-2xl p-6 text-slate-300">No trend data available.</div>;

  const smoothed = smoothTrend(trend, average);
  const prices = smoothed.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pad = (maxPrice - minPrice) * 0.15 || average * 0.1;
  const yMin = Math.floor((minPrice - pad) / 1000) * 1000;
  const yMax = Math.ceil((maxPrice + pad) / 1000) * 1000;

  const festiveOverlap = smoothed.some((item) => item.is_festive_period);

  return (
    <article className="glass rounded-2xl p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {/* Fix 4: 60-Day → 90-Day */}
          <h3 className="text-xl font-black text-white">90-Day Forward Price Trend</h3>
          <p className="text-sm text-slate-400">India domestic fares from today, with festive markers</p>
        </div>
        {/* Show Low/High labels */}
        <div className="flex gap-3 text-xs font-bold">
          <span className="rounded-full bg-success/15 px-3 py-1 text-success">Low {formatINR(minPrice)}</span>
          <span className="rounded-full bg-danger/15 px-3 py-1 text-danger">High {formatINR(maxPrice)}</span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={smoothed}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45}/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false}/>
            <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} interval={11} stroke="#94A3B8"/>
            {/* Fix 5: Y-axis domain from actual data range, not from 0 */}
            <YAxis tickFormatter={(v) => '₹' + Math.round(v / 1000) + 'k'} stroke="#94A3B8" domain={[yMin, yMax]}/>
            <Tooltip content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-2xl border border-white/10 bg-navy-800 p-3 shadow-xl">
                  <p className="font-bold text-white">{formatDate(label, { year: 'numeric' })}</p>
                  <p className="text-brand-400">{formatINR(payload[0].value)}</p>
                  {payload[0].payload.holiday_name && <p className="text-xs text-saffron">{payload[0].payload.holiday_name}</p>}
                </div>
              ) : null
            }/>
            <ReferenceLine y={average} stroke="#F59E0B" strokeDasharray="6 6" label={{ value: 'Route Avg', fill: '#F59E0B', fontSize: 12 }}/>
            {festiveOverlap && festiveAverage && (
              <ReferenceLine y={festiveAverage} stroke="#FF9933" strokeDasharray="6 6" label={{ value: 'Festive Avg Last Yr', fill: '#FF9933', fontSize: 12 }}/>
            )}
            <Area type="monotone" dataKey="price" stroke="#60A5FA" strokeWidth={3} fill="url(#priceFill)" isAnimationActive={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
