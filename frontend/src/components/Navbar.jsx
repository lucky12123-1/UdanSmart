import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [{ label: 'Home', href: '#home' }, { label: 'How It Works', href: '#how-it-works' }, { label: 'About', href: '#about' }];
  return (
    <header className={
scrolled ? 'fixed inset-x-0 top-0 z-50 bg-navy-800/90 shadow-2xl shadow-black/30 backdrop-blur-xl' : 'fixed inset-x-0 top-0 z-50 glass'
    }>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2 text-lg font-extrabold text-white">✈️ <span>SkyPredict India<span className="text-brand-500">.</span></span></a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => <a key={link.href} href={link.href} className="text-sm font-medium text-slate-300 transition hover:text-white">{link.label}</a>)}
          <a href="#search" className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white transition hover:scale-105 hover:bg-brand-600">Try Free</a>
        </div>
        <button type="button" aria-label="Toggle menu" onClick={() => setOpen((value) => !value)} className="rounded-full border border-white/10 p-2 text-white md:hidden">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && <div className="glass mx-4 mb-4 rounded-2xl p-4 md:hidden">
        {links.map((link) => <a key={link.href} onClick={() => setOpen(false)} href={link.href} className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">{link.label}</a>)}
        <a onClick={() => setOpen(false)} href="#search" className="mt-2 block rounded-full bg-brand-500 px-4 py-3 text-center text-sm font-bold text-white">Try Free</a>
      </div>}
    </header>
  );
}
