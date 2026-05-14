import { useEffect, useRef, useState } from 'react';

function CountUp({ value, suffix = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 }); if (ref.current) observer.observe(ref.current); return () => observer.disconnect(); }, []);
  return <span ref={ref}>{visible ? value : 0}{suffix}</span>;
}

export default function HowItWorks() {
  const steps = [['🔍','Enter Your Route','Choose from 82 Indian airports'], ['🤖','AI Analyzes Patterns','India-specific seasonal & festive pricing'], ['📊','Get Your Recommendation','Cheapest dates, buy/wait signal, festive alerts']];
  return <section id="how-it-works" className="bg-gradient-to-b from-navy-900 to-navy-800 px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><h2 className="text-center text-3xl font-black text-white sm:text-4xl">How SkyPredict India Works</h2><div className="relative mt-12 grid gap-6 md:grid-cols-3"><div className="absolute left-1/6 right-1/6 top-12 hidden h-px bg-white/10 md:block" />{steps.map(([icon, title, copy]) => <article key={title} className="glass relative rounded-2xl p-6 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-3xl">{icon}</div><h3 className="mt-5 text-xl font-black text-white">{title}</h3><p className="mt-2 text-sm text-slate-400">{copy}</p></article>)}</div><div className="mt-12 grid gap-4 text-center sm:grid-cols-4"><div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-black text-white"><CountUp value={82} suffix="%" /></p><p className="text-xs text-slate-400">Accuracy</p></div><div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-black text-white"><CountUp value={82} /></p><p className="text-xs text-slate-400">Indian Airports</p></div><div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-black text-white">Festive</p><p className="text-xs text-slate-400">Price Memory</p></div><div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-black text-white">Daily</p><p className="text-xs text-slate-400">Updated</p></div></div><div className="mt-10 text-center"><a href="#search" className="rounded-full bg-brand-500 px-6 py-3 font-black text-white hover:bg-brand-600">Start Predicting</a></div></div></section>;
}
