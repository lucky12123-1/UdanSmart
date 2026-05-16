import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import LoadingSkeleton from './components/LoadingSkeleton';
import Navbar from './components/Navbar';
import ResultsDashboard from './components/ResultsDashboard';
import { usePrediction } from './hooks/usePrediction';

export default function App() {
  const { predict, data, loading } = usePrediction();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [query, setQuery] = useState(null);

  // Fix 10: fire-and-forget — don't await, unblock the button immediately
  function handleSubmit(payload) {
    setQuery(payload);
    setShowSkeleton(true);

    predict(payload).finally(() => {
      setShowSkeleton(false);
      window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0D1526', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <Navbar />
      <Hero onSubmit={handleSubmit} loading={showSkeleton} />
      {showSkeleton && <LoadingSkeleton />}
      {!showSkeleton && data && <ResultsDashboard data={data} query={query} />}
      <HowItWorks />
      <section id="about" className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-400">
        <h2 className="text-2xl font-black text-white">Built for India Domestic Travel</h2>
        <p className="mt-3 leading-7">SmartUdan is scoped to India domestic routes only, with INR pricing, Indian holidays, monsoon behaviour, pilgrimage routes, tourist routes, and festive surge memory.</p>
      </section>
    </div>
  );
}
