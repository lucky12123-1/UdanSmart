import { CircleSlash } from 'lucide-react';
import { useState } from 'react';
import { cabinLabel, formatDate } from '../utils/formatters';
import BookingModal from './BookingModal';
import BuyWaitCard from './BuyWaitCard';
import FestivePriceReference from './FestivePriceReference';
import PriceCalendar from './PriceCalendar';
import PriceTable from './PriceTable';
import PriceTrendChart from './PriceTrendChart';
import RouteInsights from './RouteInsights';

export default function ResultsDashboard({ data, query }) {
  const [selectedDay, setSelectedDay] = useState(null);
  if (!data) return null;
  if (data.has_flights === false) return (
    <section id="results" className="mx-auto max-w-4xl px-4 py-16">
      <div className="glass animate-slide-up rounded-2xl p-10 text-center">
        <CircleSlash className="mx-auto text-danger" size={58}/>
        <h2 className="mt-4 text-3xl font-black text-white">No Flights Found</h2>
        <p className="mt-3 text-slate-300">No flights operate on the {data.origin}→{data.destination} route.</p>
        <p className="mt-2 text-sm text-slate-400">Try nearby airports or a connecting route via Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, or Kolkata.</p>
      </div>
    </section>
  );

  const festiveAverage = data.festive_reference?.length
    ? data.festive_reference.reduce((sum, item) => sum + (item.price_last_year || item.avg_price_inr || 0), 0) / data.festive_reference.length
    : null;

  // Fix 4: use trend_90_days (backend renamed field)
  const trendData = data.trend_90_days || data.trend_60_days || [];

  return (
    <section id="results" className="mx-auto max-w-7xl animate-slide-up px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-white/10 bg-navy-800/80 p-4 text-center font-bold text-white">
        {data.origin_city} ✈️ {data.destination_city} | {formatDate(query.travel_date_start)} - {formatDate(query.travel_date_end)} | {cabinLabel(query.cabin)} | {query.adults} Passenger{query.adults > 1 ? 's' : ''}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <BuyWaitCard data={data}/>
        <div className="lg:col-span-2">
          {/* Fix 3: PriceCalendar now shows 7-day-of-week analysis */}
          <PriceCalendar days={data.days} recommendedDate={data.recommended_date}/>
        </div>
        <div className="lg:col-span-3">
          {/* Fix 4+5: 90-day trend, clamped prices, correct Y-axis */}
          <PriceTrendChart trend={trendData} average={data.route_average_price} festiveAverage={festiveAverage}/>
        </div>
        <div className="lg:col-span-3">
          <RouteInsights days={data.days}/>
        </div>
        <div className="lg:col-span-3">
          {/* Fix 6: passes trendDays for ±3 day nearby context */}
          <PriceTable days={data.days} trendDays={trendData} recommendedDate={data.recommended_date} onBook={setSelectedDay}/>
        </div>
        <div className="lg:col-span-3">
          <FestivePriceReference items={data.festive_reference}/>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">Predictions are estimates for India domestic routes only. Always verify final fares with the airline or booking partner.</p>
      <BookingModal open={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} day={selectedDay} data={{ ...data, ...query }}/>
    </section>
  );
}
