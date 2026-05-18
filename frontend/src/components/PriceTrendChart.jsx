import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate, formatINR } from '../utils/formatters';

function trendAverage(trend) {
  if (!trend?.length) return null;
  const total = trend.reduce((sum, item) => sum + item.price, 0);
  return total / trend.length;
}

function isNearRange(value, center, tolerance = 0.35) {
  if (!value || !center) return false;
  const low = center * (1 - tolerance);
  const high = center * (1 + tolerance);
  return value >= low && value <= high;
}

export default function PriceTrendChart({ trend = [], trendAveragePrice, festiveAverage }) {
  const chartData = useMemo(() => trend ?? [], [trend]);

  const avg = useMemo(() => {
    if (typeof trendAveragePrice === 'number' && trendAveragePrice > 0) return trendAveragePrice;
    return trendAverage(chartData);
  }, [chartData, trendAveragePrice]);

  if (!chartData.length || !avg) {
    return <div className="glass rounded-2xl p-6 text-slate-300">No trend data available.</div>;
  }

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pad = Math.max((maxPrice - minPrice) * 0.12, avg * 0.05);
  const yMin = Math.max(0, Math.floor((minPrice - pad) / 500) * 500);
  const yMax = Math.ceil((maxPrice + pad) / 500) * 500;

  const showFestiveLine = festiveAverage && isNearRange(festiveAverage, avg);
  const festiveOverlap = chartData.some((item) => item.is_festive_period);

  return (
    <article className="glass rounded-2xl p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white">90-Day Forward Price Trend</h3>
          <p className="text-sm text-slate-400">Projected fares from today — average line matches this chart</p>
        </div>
        <div className="flex gap-3 text-xs font-bold">
          <span className="rounded-full bg-success/15 px-3 py-1 text-success">Low {formatINR(minPrice)}</span>
          <span className="rounded-full bg-warning/15 px-3 py-1 text-warning">Avg {formatINR(Math.round(avg))}</span>
          <span className="rounded-full bg-danger/15 px-3 py-1 text-danger">High {formatINR(maxPrice)}</span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} interval={11} stroke="#94A3B8" />
            <YAxis tickFormatter={(v) => '₹' + Math.round(v / 1000) + 'k'} stroke="#94A3B8" domain={[yMin, yMax]} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-2xl border border-white/10 bg-navy-800 p-3 shadow-xl">
                    <p className="font-bold text-white">{formatDate(label, { year: 'numeric' })}</p>
                    <p className="text-brand-400">{formatINR(payload[0].value)}</p>
                    {payload[0].payload.holiday_name && (
                      <p className="text-xs text-saffron">{payload[0].payload.holiday_name}</p>
                    )}
                  </div>
                ) : null
              }
            />
            <ReferenceLine
              y={avg}
              stroke="#F59E0B"
              strokeDasharray="6 6"
              label={{ value: '90-day avg', fill: '#F59E0B', fontSize: 12 }}
            />
            {festiveOverlap && showFestiveLine && (
              <ReferenceLine
                y={festiveAverage}
                stroke="#FF9933"
                strokeDasharray="6 6"
                label={{ value: 'Festive ref', fill: '#FF9933', fontSize: 12 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#60A5FA"
              strokeWidth={3}
              fill="url(#priceFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
