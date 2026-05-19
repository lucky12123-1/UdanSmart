import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cabinLabel, formatDate, formatINR } from '../utils/formatters';

export default function BookingModal({ open, onClose, day, data }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    setDone(false);
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    const timer = window.setTimeout(() => setDone(true), 3000);
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open || !day) return null;
  const route = data.origin + '-' + data.destination;
  const googleHref =
    'https://www.google.com/travel/flights?q=Flights%20to%20' +
    encodeURIComponent(data.destination_city || data.destination) +
    '%20from%20' +
    encodeURIComponent(data.origin_city || data.origin) +
    '%20on%20' +
    day.date;
  return <div onMouseDown={onClose} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"><div onMouseDown={(event) => event.stopPropagation()} className="glass w-full max-w-lg animate-slide-up rounded-2xl p-6"><div className="flex items-start justify-between"><div><h3 className="text-2xl font-black text-white">Booking handoff</h3><p className="mt-1 text-sm text-slate-400">{data.origin_city} to {data.destination_city}</p></div><button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 text-white"><X size={18}/></button></div><div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-slate-300"><p><b className="text-white">Route:</b> {route}</p><p><b className="text-white">Date:</b> {formatDate(day.date, { weekday: 'long', year: 'numeric' })}</p><p><b className="text-white">Cabin:</b> {cabinLabel(data.cabin || 'economy')}</p><p><b className="text-white">Passengers:</b> {data.adults || 1}</p><p><b className="text-white">Predicted price:</b> {formatINR(day.price)}</p></div>{!done ? <><p className="mt-5 text-center text-sm font-bold text-brand-400">Connecting you to live booking...</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full animate-[slideUp_3s_linear] bg-brand-500" /></div></> : <div className="mt-5 space-y-3"><p className="text-sm text-slate-300">This link opens Google Flights for live booking. SmartUdan does not sell tickets, and final prices may vary.</p><a href={googleHref} target="_blank" rel="noreferrer" className="block rounded-full bg-brand-500 px-4 py-3 text-center font-black text-white">Continue to Google Flights</a><button type="button" onClick={onClose} className="block w-full rounded-full bg-white/10 px-4 py-3 font-black text-white">Close</button></div>}</div></div>;
}
