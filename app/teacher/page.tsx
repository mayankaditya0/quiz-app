"use client";

import { useEffect, useMemo, useState } from "react";

import { socket } from "../../lib/socket";

type DraftQuestion = {
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
};

type BuzzerAttempt = {
  studentId: string;
  name: string;
  deltaMs: number;
};

type LeaderboardRow = {
  id: string;
  name: string;
  score: number;
};

type TeacherState = {
  studentCount: number;
  quizName: string;
  totalQuestions: number;
  quizLaunched: boolean;
  currentQuestionIndex: number;
  questionActive: boolean;
  quizEnded: boolean;
  buzzerAttempts: BuzzerAttempt[];
  leaderboard: LeaderboardRow[];
  top3: LeaderboardRow[];
};

const defaultQuestion: DraftQuestion = {
  question: "",
  options: ["", "", "", ""],
  answerIndex: 0,
};

export default function TeacherPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([{ ...defaultQuestion }]);

  const [state, setState] = useState<TeacherState>({
    studentCount: 0,
    quizName: "",
    totalQuestions: 0,
    quizLaunched: false,
    currentQuestionIndex: -1,
    questionActive: false,
    quizEnded: false,
    buzzerAttempts: [],
    leaderboard: [],
    top3: [],
  });

  useEffect(() => {
    socket.on("teacherState", setState);
    return () => {
      socket.off("teacherState", setState);
    };
  }, []);

  const addQuestion = () => setQuestions((prev) => [...prev, { ...defaultQuestion }]);

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const launchDisabled = !state.quizName || state.studentCount < 1 || state.quizLaunched;

  const canPushQuestion = state.quizLaunched && !state.quizEnded && state.currentQuestionIndex + 1 < state.totalQuestions;

  const saveQuiz = () => {
    socket.emit("teacherSaveQuiz", { name: quizName, questions }, (res: { ok: boolean; message?: string }) => {
      setMessage(res.ok ? "Quiz saved successfully." : res.message || "Unable to save quiz");
    });
  };

  const sortedBuzzer = useMemo(() => [...state.buzzerAttempts].sort((a, b) => a.deltaMs - b.deltaMs), [state.buzzerAttempts]);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <section className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">Teacher Admin</h1>
          <p className="text-slate-300 mb-6">Enter admin password to continue.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600"
          />
          <button
            onClick={() => {
              socket.emit("teacherAuth", password, (res: { ok: boolean; message?: string }) => {
                if (res.ok) {
                  setAuthenticated(true);
                  setMessage("");
                } else {
                  setMessage(res.message || "Unauthorized");
                }
              });
            }}
            className="mt-4 w-full p-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold"
          >
            Unlock Teacher Panel
          </button>
          {message ? <p className="mt-3 text-rose-300">{message}</p> : null}
          <p className="mt-4 text-xs text-slate-400">Configured password: Admin@123</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Quiz Control Center</h1>
            <span className="text-sm bg-slate-800 border border-slate-600 rounded-full px-3 py-1">Students Live: {state.studentCount}</span>
          </div>

          <div className="mt-5 space-y-4">
            <input
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Create Quiz Name"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 p-3"
            />
            <button onClick={saveQuiz} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold">
              Save Quiz Draft
            </button>
          </div>

          <div className="mt-6 space-y-5 max-h-[52vh] overflow-auto pr-1">
            {questions.map((q, qIdx) => (
              <article key={qIdx} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <h3 className="font-semibold mb-3">Question {qIdx + 1}</h3>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                  placeholder="Type question"
                  className="w-full rounded-lg bg-slate-900 border border-slate-600 p-3 mb-3"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  {q.options.map((option, optIdx) => (
                    <label key={optIdx} className="block">
                      <span className="text-xs text-slate-300">Option {optIdx + 1}</span>
                      <input
                        value={option}
                        onChange={(e) => {
                          const nextOptions = [...q.options] as DraftQuestion["options"];
                          nextOptions[optIdx] = e.target.value;
                          updateQuestion(qIdx, { options: nextOptions });
                        }}
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-600 p-2"
                      />
                    </label>
                  ))}
                </div>
                <select
                  value={q.answerIndex}
                  onChange={(e) => updateQuestion(qIdx, { answerIndex: Number(e.target.value) })}
                  className="mt-3 rounded-lg bg-slate-900 border border-slate-600 p-2"
                >
                  <option value={0}>Correct: Option 1</option>
                  <option value={1}>Correct: Option 2</option>
                  <option value={2}>Correct: Option 3</option>
                  <option value={3}>Correct: Option 4</option>
                </select>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={addQuestion} className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600">+ Add Question</button>
            <button
              disabled={launchDisabled}
              onClick={() => socket.emit("teacherLaunchQuiz", (res: { ok: boolean; message?: string }) => setMessage(res.ok ? "Quiz launched" : res.message || "Cannot launch"))}
              className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40"
            >
              Launch Quiz
            </button>
            <button
              disabled={!canPushQuestion}
              onClick={() => socket.emit("teacherPushQuestion", (res: { ok: boolean; message?: string }) => setMessage(res.ok ? "Question pushed" : res.message || "Unable to push question"))}
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold disabled:opacity-40"
            >
              Push Next Question
            </button>
            <button
              disabled={!state.quizLaunched || state.quizEnded}
              onClick={() => socket.emit("teacherEndQuiz", (res: { ok: boolean; message?: string }) => setMessage(res.ok ? "Quiz ended" : res.message || "Unable to end quiz"))}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40"
            >
              End Quiz
            </button>
          </div>
          {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <h2 className="font-bold mb-2">Buzzer Timings (Top Right)</h2>
            <div className="space-y-2 max-h-64 overflow-auto">
              {sortedBuzzer.map((b, i) => (
                <div key={b.studentId} className="rounded-lg bg-slate-800 p-2">
                  <div className="text-sm font-semibold">#{i + 1} {b.name}</div>
                  <div className="text-xs text-slate-300">{(b.deltaMs / 1000).toFixed(3)}s</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => socket.emit("teacherEvaluateAnswer", { studentId: b.studentId, isCorrect: true })}
                      className="px-2 py-1 text-xs rounded bg-emerald-600"
                    >
                      Right (+10)
                    </button>
                    <button
                      onClick={() => socket.emit("teacherEvaluateAnswer", { studentId: b.studentId, isCorrect: false })}
                      className="px-2 py-1 text-xs rounded bg-slate-600"
                    >
                      Wrong
                    </button>
                  </div>
                </div>
              ))}
              {sortedBuzzer.length === 0 ? <p className="text-sm text-slate-400">No buzzer hits yet.</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <h2 className="font-bold mb-2">Scores (Bottom Right)</h2>
            <div className="max-h-72 overflow-auto space-y-1">
              {state.leaderboard.map((row, index) => (
                <div key={row.id} className="flex justify-between text-sm rounded bg-slate-800 px-2 py-1">
                  <span>{index + 1}. {row.name}</span>
                  <span>{row.score}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {state.quizEnded ? (
        <section className="mt-4 rounded-2xl border border-yellow-500/50 bg-yellow-500/10 p-5">
          <h2 className="text-xl font-bold mb-3">Quiz Ended — Top 3</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {state.top3.map((row, idx) => (
              <div key={row.id} className="rounded-lg bg-slate-900 border border-yellow-500/30 p-3">
                <p className="text-sm text-yellow-300">Rank #{idx + 1}</p>
                <p className="font-semibold">{row.name}</p>
                <p>{row.score} pts</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              if (window.confirm("Start quiz again? This resets all scores.")) {
                socket.emit("teacherRestartQuiz", (res: { ok: boolean; message?: string }) => {
                  setMessage(res.ok ? "Quiz reset. Save/launch again." : res.message || "Unable to reset");
                });
              }
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600"
          >
            Back / Start Again
          </button>
        </section>
      ) : null}
    </main>
  );
}
