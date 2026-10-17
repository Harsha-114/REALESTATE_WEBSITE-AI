"use client";

import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ChatWidget from "./ChatWidget";
import { useState } from "react";

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Nav />
      <main>
        <section className="bg-[var(--navy)] px-6 py-24 text-center text-white">
          <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Praneeta Developers
          </h1>
          <p className="mx-auto mt-3 max-w-md border-t border-[var(--clay)] pt-3 text-sm uppercase tracking-widest text-[var(--clay)]">
            Building dreams, creating homes
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/properties/sy-no-18"
              className="rounded-md bg-[var(--clay)] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              View Sy No 18 Layout
            </Link>
            <button
              onClick={() => setChatOpen(true)}
              className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Ask the advisor
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-3">
            <Value
              title="Live availability"
              body="See exactly which plots are open, held or sold, updated in real time."
            />
            <Value
              title="A plan built for you"
              body="Compare plots side by side and get a recommendation suited to your budget."
            />
            <Value
              title="Clear communication"
              body="Ask questions any time and book a site visit on a slot that works for you."
            />
          </div>
        </section>

        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display mb-6 text-2xl font-medium">Current project</h2>
            <Link
              href="/properties/sy-no-18"
              className="block overflow-hidden rounded-lg border border-[var(--line)] transition-transform hover:-translate-y-0.5"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/layout.jpg" alt="Sy No 18 layout" className="h-56 w-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-medium">Sy No 18, Indrakaran</h3>
                <p className="mt-1 text-sm text-[var(--ink)]/60">
                  Open plots in Indrakaran village, with 30 ft internal roads and proximity to the 100 ft Rudraram road.
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-[var(--navy)]">
                  View layout and availability →
                </span>
              </div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}

function Value({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--ink)]/60">{body}</p>
    </div>
  );
}