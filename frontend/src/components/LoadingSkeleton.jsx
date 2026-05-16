export default function LoadingSkeleton() {
  return (
    <section id="results" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass rounded-2xl p-10 text-center">
        {/* Plane animation */}
        <div className="mb-6 flex justify-center">
          <span className="text-5xl animate-bounce">✈️</span>
        </div>
        <p className="text-xl font-black text-white">Analysing best day for you...</p>
        <p className="mt-2 text-sm text-slate-400">Checking 90 days of fare patterns across festive seasons, weekends & holidays</p>

        {/* Static progress bar */}
        <div className="mx-auto mt-6 h-1.5 max-w-xs rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-brand-500 animate-pulse" />
        </div>

        {/* Static skeleton cards — no shimmer shift */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-2xl bg-white/5 border border-white/5" />
          <div className="h-64 rounded-2xl bg-white/5 border border-white/5 lg:col-span-2" />
          <div className="h-72 rounded-2xl bg-white/5 border border-white/5 lg:col-span-3" />
        </div>
      </div>
    </section>
  );
}
