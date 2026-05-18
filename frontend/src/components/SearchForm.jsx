import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowLeftRight, Minus, PlaneTakeoff, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import AirportAutocomplete from './AirportAutocomplete';
import { dateToISO } from '../utils/formatters';

const CABINS = [
  ['economy', 'Economy 💺'], ['premium_economy', 'Premium Economy 🛋️'], ['business', 'Business 💼'], ['first', 'First Class 👑']
];

export default function SearchForm({ onSubmit, loading }) {
  const tomorrow = useMemo(() => { const day = new Date(); day.setDate(day.getDate() + 1); day.setHours(0,0,0,0); return day; }, []);
  const minReturn = useMemo(() => { const day = new Date(); day.setDate(day.getDate() + 2); day.setHours(0,0,0,0); return day; }, []);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(new Date(tomorrow.getTime() + 4 * 86400000));
  const [oneWay, setOneWay] = useState(false);
  const [cabin, setCabin] = useState('economy');
  const [adults, setAdults] = useState(1);
  const [errors, setErrors] = useState({});

  function swap() {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  }

  function validate() {
    const next = {};
    if (!origin) next.origin = 'Origin airport is required';
    if (!destination) next.destination = 'Destination airport is required';
    if (origin && destination && origin.code === destination.code) next.destination = 'Origin and destination cannot be the same';
    if (!startDate || startDate < tomorrow) next.startDate = 'Travel dates must be in the future';
    if (!oneWay && (!endDate || endDate <= startDate)) next.endDate = 'Return date must be after departure date';
    if (!oneWay && endDate && startDate && (endDate - startDate) / 86400000 > 30) next.endDate = 'Date range cannot exceed 30 days';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleStartDateChange(date) {
    setStartDate(date);
    // Ensure return date is always at least 1 day after departure
    const nextDay = new Date(date.getTime() + 86400000);
    if (!oneWay && endDate <= date) {
      setEndDate(nextDay);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({ origin: origin.code, destination: destination.code, travel_date_start: dateToISO(startDate), travel_date_end: dateToISO(oneWay ? startDate : endDate), cabin, adults });
  }

  const returnMinDate = startDate ? new Date(startDate.getTime() + 86400000) : minReturn;

  return (
    <form id="search" onSubmit={handleSubmit} className="glass w-full max-w-[900px] rounded-2xl p-4 shadow-2xl shadow-black/30 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">

        {/* Origin | Swap | Destination — dedicated center column for even spacing */}
        <div className="md:col-span-2 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-start md:gap-x-5">
          <AirportAutocomplete label="Origin" value={origin} onChange={setOrigin} otherAirport={destination} error={errors.origin} />

          <div className="hidden md:flex shrink-0 items-center justify-center self-start pt-7">
            <button
              type="button"
              onClick={swap}
              title="Swap airports"
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-500 bg-navy-900 text-brand-400 shadow-lg transition hover:bg-brand-500 hover:text-white"
            >
              <ArrowLeftRight size={15} />
            </button>
          </div>

          <AirportAutocomplete label="Destination" value={destination} onChange={setDestination} otherAirport={origin} error={errors.destination} />

          {/* Mobile swap button — full width below the fields */}
          <div className="md:hidden col-span-2 flex justify-center">
            <button
              type="button"
              onClick={swap}
              className="flex items-center gap-2 rounded-full border border-brand-500/50 bg-brand-500/10 px-4 py-2 text-sm font-bold text-brand-400 transition hover:bg-brand-500 hover:text-white"
            >
              <ArrowLeftRight size={14} /> Swap Airports
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-left text-sm font-bold text-slate-200">Departure Date</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            minDate={tomorrow}
            className="h-12 w-full rounded-2xl border border-white/10 bg-navy-900/80 px-4 font-semibold text-white outline-none focus:border-brand-500"
            wrapperClassName="datepicker-dark"
          />
          {errors.startDate && <p className="mt-2 text-left text-xs font-semibold text-danger">{errors.startDate}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-bold text-slate-200">Return Date</label>
            <button type="button" onClick={() => setOneWay((v) => !v)} className={clsx('rounded-full px-3 py-1 text-xs font-bold', oneWay ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-300')}>One Way</button>
          </div>
          <DatePicker
            disabled={oneWay}
            selected={oneWay ? null : endDate}
            onChange={(date) => setEndDate(date)}
            minDate={returnMinDate}
            maxDate={new Date(startDate.getTime() + 30 * 86400000)}
            placeholderText={oneWay ? 'One way selected' : 'Select return date'}
            className="h-12 w-full rounded-2xl border border-white/10 bg-navy-900/80 px-4 font-semibold text-white outline-none disabled:opacity-50"
            wrapperClassName="datepicker-dark"
          />
          {errors.endDate && <p className="mt-2 text-left text-xs font-semibold text-danger">{errors.endDate}</p>}
        </div>

        <div>
          <label className="mb-2 block text-left text-sm font-bold text-slate-200">Cabin Class</label>
          <div className="grid grid-cols-2 gap-2">
            {CABINS.map(([value, label]) => (
              <button key={value} type="button" onClick={() => setCabin(value)} className={clsx('rounded-2xl border px-3 py-3 text-sm font-bold transition', cabin === value ? 'border-brand-500 bg-brand-500 text-white' : 'border-white/10 bg-navy-900/80 text-slate-300 hover:bg-white/5')}>{label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-left text-sm font-bold text-slate-200">Passengers</label>
          <div className="flex h-12 items-center justify-between rounded-2xl border border-white/10 bg-navy-900/80 px-3">
            <button type="button" onClick={() => setAdults((v) => Math.max(1, v - 1))} className="rounded-full bg-white/10 p-2 text-white"><Minus size={16}/></button>
            <span className="text-lg font-black">{adults}</span>
            <button type="button" onClick={() => setAdults((v) => Math.min(9, v + 1))} className="rounded-full bg-white/10 p-2 text-white"><Plus size={16}/></button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-base font-black text-white shadow-xl shadow-brand-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <PlaneTakeoff size={22} />}
        {loading ? 'Analyzing prices...' : 'Predict Best Price'}
      </button>
    </form>
  );
}
