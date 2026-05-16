import { useEffect, useRef, useState } from 'react';

const SAVINGS_FACTS = [
  { emoji: '🗓️', fact: 'Flying mid-week saves up to 35% on most Indian routes' },
  { emoji: '🪔', fact: 'Diwali fares spike 2–3× — book 6 weeks early to beat the rush' },
  { emoji: '🌧️', fact: 'Monsoon routes to Goa & Leh drop 40% — the hidden bargain season' },
  { emoji: '⏰', fact: 'Booking 30–45 days out is the sweet spot for India domestic fares' },
];

const STEPS = [
  { icon: '🛫', title: 'Pick Your Route', copy: 'Search any India domestic route — metro to metro, or tier-2 gems like Jaisalmer, Dibrugarh, Agatti' },
  { icon: '🧠', title: 'AI Reads the Market', copy: 'Our model analyses festive surges, monsoon dips, weekend spikes & last-minute panic pricing in real time' },
  { icon: '💸', title: 'You Save Money', copy: 'Get the exact date to fly + a Buy or Wait signal — so you never overpay on a ticket again' },
];

function useCountUp(target, duration, trigger) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return val;
}

function StatCard({ value, suffix, label, trigger }) {
  const animated = useCountUp(value, 1600, trigger);
  return (
    <div className="rounded-2xl bg-white/5 p-5 text-center border border-white/5">
      <p className="text-3xl font-black text-white">{animated}{suffix}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

export default function HowItWorks() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="bg-gradient-to-b from-navy-900 to-navy-800 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-black text-white sm:text-4xl">How SmartUdan Works</h2>
        <p className="mt-3 text-center text-slate-400">Stop guessing. Start saving.</p>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="absolute left-1/6 right-1/6 top-12 hidden h-px bg-white/10 md:block" />
          {STEPS.map((step, i) => (
            <article key={step.title} className="glass relative rounded-2xl p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-3xl">{step.icon}</div>
              <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-black text-white">{i + 1}</div>
              <h3 className="mt-5 text-xl font-black text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{step.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-4 text-center text-sm font-black text-slate-300 uppercase tracking-widest">💡 Insider Fare Secrets</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {SAVINGS_FACTS.map((item) => (
              <div key={item.fact} className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-sm text-slate-300">{item.fact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-center sm:grid-cols-4">
          <StatCard value={90} suffix="+" label="Days Analysed Per Search" trigger={visible} />
          <StatCard value={40} suffix="%" label="Avg Savings Found" trigger={visible} />
          <StatCard value={6} suffix=" wks" label="Ideal Booking Window" trigger={visible} />
          <StatCard value={3} suffix="×" label="Festive Price Spike (Diwali)" trigger={visible} />
        </div>

        <div className="mt-10 text-center">
          <a href="#search" className="rounded-full bg-brand-500 px-8 py-3 font-black text-white hover:bg-brand-600 transition hover:scale-105">
            Start Predicting →
          </a>
        </div>
      </div>
    </section>
  );
}
