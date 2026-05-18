import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useAirportSearch } from '../hooks/useAirportSearch';

export default function AirportAutocomplete({ label, value, onChange, otherAirport, error }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const { results } = useAirportSearch(query);
  const sameRoute = value && otherAirport && value.code === otherAirport.code;

  useEffect(() => {
    const onClick = (event) => { if (!wrapperRef.current?.contains(event.target)) setOpen(false); };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  function selectAirport(airport) {
    onChange(airport);
    setQuery('');
    setOpen(false);
    setHighlight(0);
  }

  function onKeyDown(event) {
    if (!open && ['ArrowDown', 'ArrowUp'].includes(event.key)) setOpen(true);
    if (event.key === 'ArrowDown') { event.preventDefault(); setHighlight((current) => Math.min(current + 1, results.length - 1)); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setHighlight((current) => Math.max(current - 1, 0)); }
    if (event.key === 'Enter' && open && results[highlight]) { event.preventDefault(); selectAirport(results[highlight]); }
    if (event.key === 'Escape') setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-left text-sm font-bold text-slate-200">{label}</label>
      <div className="relative">
        <input
          value={value ? value.code : query}
          onChange={(event) => { setQuery(event.target.value); setOpen(event.target.value.length > 0); onChange(null); }}
          onFocus={() => { if (!value && query) setOpen(true); }}
          onKeyDown={onKeyDown}
          className={clsx('h-12 w-full rounded-2xl border bg-navy-900/80 px-4 pr-11 font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-brand-500', sameRoute || error ? 'border-danger' : 'border-white/10')}
          placeholder="Search city, airport or IATA"
        />
        {value && <button type="button" onClick={() => { onChange(null); setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-1 text-slate-300 hover:text-white" aria-label="Clear airport"><X size={16} /></button>}
      </div>
      <p className="mt-2 min-h-5 text-left text-xs text-slate-400">
        {value ? `${value.name}, ${value.city}` : '\u00a0'}
      </p>
      <p className={clsx('mt-2 min-h-5 text-left text-xs', (sameRoute || error) && 'font-semibold text-danger')}>
        {sameRoute ? 'Origin and destination cannot be the same' : error}
      </p>
      {open && !value && results.length > 0 && <div className="absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/10 bg-navy-800 shadow-2xl shadow-black/40">
        {results.map((airport, index) => <button key={airport.code} type="button" onMouseEnter={() => setHighlight(index)} onClick={() => selectAirport(airport)} className={clsx('w-full px-4 py-3 text-left transition hover:bg-white/5', highlight === index && 'bg-brand-500/10')}>
          <div className="flex items-center justify-between gap-3"><span className="truncate text-sm text-white"><span className="mr-2">{airport.flag}</span><span className="font-black text-brand-400">{airport.code}</span> — {airport.city}</span><span className={clsx('rounded-full px-2 py-1 text-[10px] font-black', airport.type === 'International' ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-600/40 text-slate-300')}>{airport.type === 'International' ? 'INTL' : 'DOM'}</span></div>
          <p className="mt-1 truncate pl-7 text-xs text-slate-400">{airport.name} · {airport.type}</p>
        </button>)}
      </div>}
    </div>
  );
}
