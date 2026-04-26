"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
        <h1 className="text-4xl font-black">Realtime Quiz Arena</h1>
        <p className="mt-2 text-slate-300">Kahoot-style LAN quiz for teacher and students.</p>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link href="/student" className="rounded-xl bg-cyan-600 hover:bg-cyan-500 p-6 text-xl font-bold">
            Student Flow
          </Link>
          <Link href="/teacher" className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 p-6 text-xl font-bold">
            Teacher Flow
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-400">Teacher URL on same Wi‑Fi: http://192.168.1.231:3000/teacher</p>
      </section>
    </main>
  );
}
