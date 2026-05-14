import { ChevronDown } from 'lucide-react';
import SearchForm from './SearchForm';

export default function Hero({ onSubmit, loading }) {
  const particles = Array.from({ length: 20 }, (_, index) => ({ left: (index * 37) % 100, top: (index * 53) % 100, delay: (index % 7) * 0.35 }));
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-navy-900 px-4 pt-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(147,51,234,0.16),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(19,136,8,0.12),transparent_30%)] animate-pulse-slow" />
      {particles.map((dot, index) => <span key={index} className="absolute h-1.5 w-1.5 rounded-full bg-brand-400/50 animate-float" style={{ left: dot.left + '%', top: dot.top + '%', animationDelay: dot.delay + 's' }} />)}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col items-center justify-center gap-8 pb-16 text-center">
        <div className="animate-fade-in rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-400">🤖 Powered by Machine Learning</div>
        <div className="max-w-4xl animate-slide-up">
          <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-6xl lg:text-7xl">Find the <span className="bg-gradient-to-r from-brand-400 via-saffron to-india-green bg-clip-text text-transparent">Cheapest</span> Day to Fly</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl">AI-powered predictions across India's domestic routes. Save up to 40% on every booking.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-300 sm:text-sm">
            {['82% Accuracy', '82 Indian Airports', 'Updated Daily', 'Free to Use'].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{item}</span>)}
          </div>
        </div>
        <SearchForm onSubmit={onSubmit} loading={loading} />
      </div>
      <a href="#results" className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-slate-400 animate-bounce" aria-label="Scroll to results"><ChevronDown /></a>
    </section>
  );
}
