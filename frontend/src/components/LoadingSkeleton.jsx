import { useEffect, useState } from 'react';

const messages = ['Fetching Skyscanner price data for this route...', 'Analyzing Indian seasonal patterns...', 'Running price prediction model...', 'Calculating optimal booking window...', 'Generating price calendar...'];

export default function LoadingSkeleton() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % messages.length), 600);
    return () => window.clearInterval(timer);
  }, []);
  return <section id="results" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="glass rounded-2xl p-6"><p className="mb-6 text-center text-sm font-bold text-brand-400">{messages[index]}</p><div className="grid gap-6 lg:grid-cols-3"><div className="h-72 rounded-2xl shimmer"/><div className="h-72 rounded-2xl shimmer lg:col-span-2"/><div className="h-80 rounded-2xl shimmer lg:col-span-3"/><div className="h-44 rounded-2xl shimmer"/><div className="h-44 rounded-2xl shimmer"/><div className="h-44 rounded-2xl shimmer"/></div></div></section>;
}
