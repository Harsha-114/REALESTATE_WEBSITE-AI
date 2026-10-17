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
            <button className="flex items-center gap-1" type="button">
              Properties
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 ${propsOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {propsOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-md border border-[var(--line)] bg-white p-2 shadow-lg">
                <Link href="/properties" className="block rounded px-3 py-2 text-sm text-[var(--navy)] hover:bg-[var(--line)]">
                  All Properties
                </Link>
                <Link href="/properties?type=buy" className="block rounded px-3 py-2 text-sm text-[var(--navy)] hover:bg-[var(--line)]">
                  Buy
                </Link>
                <Link href="/properties?type=rent" className="block rounded px-3 py-2 text-sm text-[var(--navy)] hover:bg-[var(--line)]">
                  Rent
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