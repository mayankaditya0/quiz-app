"use client";

import { useEffect, useState } from "react";

import { socket } from "../../lib/socket";

type StudentState = {
  quizName: string;
  quizLaunched: boolean;
  questionActive: boolean;
  quizEnded: boolean;
  currentQuestion: {
    index: number;
    total: number;
    question: string;
    options: string[];
  } | null;
  hasBuzzed: boolean;
  myScore: number;
};

export default function StudentPage() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");

  const [state, setState] = useState<StudentState>({
    quizName: "",
    quizLaunched: false,
    questionActive: false,
    quizEnded: false,
    currentQuestion: null,
    hasBuzzed: false,
    myScore: 0,
  });

  useEffect(() => {
    socket.on("studentState", setState);
    return () => {
      socket.off("studentState", setState);
    };
  }, []);

  if (!joined) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-sky-500 p-4 flex items-center justify-center">
        <section className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-2xl">
          <h1 className="text-3xl font-bold text-slate-900">Join Live Quiz</h1>
          <p className="text-slate-600 mt-1">Enter your name and wait for teacher to launch.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-4 w-full rounded-lg border border-slate-300 p-3"
          />
          <button
            onClick={() => {
              socket.emit("studentJoin", { name }, (res: { ok: boolean; message?: string }) => {
                if (res.ok) {
                  setJoined(true);
                  setMessage("");
                } else {
                  setMessage(res.message || "Unable to join");
                }
              });
            }}
            className="mt-3 w-full rounded-lg bg-slate-900 text-white p-3 font-semibold"
          >
            Enter Quiz Arena
          </button>
          {message ? <p className="text-rose-600 mt-2 text-sm">{message}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-4 flex items-center justify-between rounded-xl border border-slate-700 p-4 bg-slate-900">
        <div>
          <p className="text-xs text-slate-400">Quiz</p>
          <h1 className="text-xl font-bold">{state.quizName || "Waiting for teacher"}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Your Score</p>
          <p className="text-2xl font-extrabold text-emerald-300">{state.myScore}</p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 min-h-[60vh] flex flex-col justify-center">
        {!state.quizLaunched ? <p className="text-center text-xl text-slate-300">Teacher has not launched the quiz yet.</p> : null}

        {state.quizLaunched && !state.questionActive ? (
          <p className="text-center text-xl text-amber-300">Question will appear here when teacher pushes it.</p>
        ) : null}

        {state.currentQuestion ? (
          <>
            <p className="text-sm text-cyan-300 mb-3">
              Question {state.currentQuestion.index + 1} of {state.currentQuestion.total}
            </p>
            <h2 className="text-2xl font-bold mb-6">{state.currentQuestion.question}</h2>

            <div className="grid md:grid-cols-2 gap-3">
              {state.currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  className="text-left rounded-xl border border-slate-600 bg-slate-800 p-4 hover:bg-slate-700"
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              disabled={state.hasBuzzed || !state.questionActive}
              onClick={() => {
                socket.emit("studentBuzz", (res: { ok: boolean; message?: string }) => {
                  setMessage(res.ok ? "Buzzed! Wait for teacher judgment." : res.message || "Unable to buzz");
                });
              }}
              className="mt-6 w-full rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 p-4 text-xl font-bold"
            >
              {state.hasBuzzed ? "Buzzed Already" : "Press Buzzer 🔔"}
            </button>
          </>
        ) : null}

        {state.quizEnded ? <p className="mt-6 text-center text-2xl font-bold text-yellow-300">Quiz ended. Thanks for playing!</p> : null}

        {message ? <p className="mt-4 text-center text-cyan-200">{message}</p> : null}
      </section>
    </main>
  );
}
