"use client";

import { useEffect, useState } from "react";

import { socket } from "../../lib/socket";

export default function Teacher() {

  type BuzzerEntry = { name: string; order: number };
  const [buzzer, setBuzzer] = useState<BuzzerEntry[]>([]);

  const [lb, setLb] = useState<Record<string, number>>({});

  useEffect(() => {

    socket.on("buzzerUpdate", setBuzzer);

    socket.on("leaderboard", setLb);

  }, []);

  const sampleQuiz = {

    title: "Demo",

    questions: [

      {

        question: "Capital of India?",

        options: ["Delhi","Mumbai","Chennai","Kolkata"],

        answer: "Delhi"

      }

    ]

  };

  return (
<div className="flex h-screen">

      {/* LEFT */}
<div className="w-2/3 p-4 bg-gray-900 text-white">
<h1 className="text-xl mb-4">Teacher Panel</h1>
<button onClick={() => socket.emit("createQuiz", sampleQuiz)}>Load Quiz</button>
<button onClick={() => socket.emit("selectQuiz", 0)}>Select</button>
<button onClick={() => socket.emit("showQ")}>Show Question</button>
<button onClick={() => socket.emit("next")}>Next</button>
<h2 className="mt-6">Leaderboard</h2>

        {Object.entries(lb).map(([n, s]: [string, number], i) => (
<div key={n}>{i+1}. {n} - {s}</div>

        ))}
</div>

      {/* RIGHT - BUZZER PANEL */}
<div className="w-1/3 bg-white p-4">
<h2 className="font-bold">Buzzer Order</h2>

        {buzzer.map((b,i)=>(
<div key={i} className="p-2 border mb-2 rounded">

            {b.order}. {b.name}
</div>

        ))}
</div>
</div>

  );

}
