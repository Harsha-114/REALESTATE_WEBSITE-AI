"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [propsOpen, setPropsOpen] = useState(false);

  return (
    <nav className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2">
            <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-lg font-semibold leading-none text-[var(--navy)]">
            Praneeta
            <span className="block text-[10px] font-normal tracking-wide text-[var(--ink)]/50">
              DEVELOPERS
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-7 text-sm font-medium text-[var(--navy)]">
          <Link href="/">Home</Link>
          <div
            className="relative"
            onMouseEnter={() => setPropsOpen(true)}
            onMouseLeave={() => setPropsOpen(false)}
          >
            <button className="flex items-center gap-1">
              Properties
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {propsOpen && (
              <div className="absolute left-0 top-full w-56 rounded-md border border-[var(--line)] bg-white py-2 shadow-lg">
                <Link href="/properties" className="block px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper)]">
                  All Properties
                </Link>
                <Link href="/properties/sy-no-18" className="block px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper)]">
                  Sy No 18, Indrakaran
                </Link>
                <Link href="/properties/santorini-villas" className="block px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper)]">
                  Santorini Villas, Mokila
                </Link>
              </div>
            )}
          </div>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </nav>
  );
}