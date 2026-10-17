import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <span className="font-display text-lg font-semibold">Praneeta Developers</span>
          <p className="mt-2 text-sm text-white/60">
            Real estate development in and around Hyderabad, focused on quality and transparency.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/properties">Properties</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Reach Us</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>info@praneeta.dev</li>
            <li>+91 XXXXX XXXXX</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Praneeta Developers. All rights reserved.
      </div>
    </footer>
  );
}