"use client";

import { useEffect, useState } from "react";

import { socket } from "../../lib/socket";

export default function Student() {

  const [name, setName] = useState("");

  const [joined, setJoined] = useState(false);

  type Question = {
    question: string;
    options: string[];
  };

  const [q, setQ] = useState<Question | null>(null);

  const [turn, setTurn] = useState("");

  useEffect(() => {

    socket.on("question", (data) => {

      setQ(data);

      new Audio("/sound.mp3").play();

    });

    socket.on("turn", setTurn);

  }, []);

  if (!joined) {

    return (
<div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500">
<div className="bg-white p-6 rounded-xl shadow-lg">
<input

            className="border p-2 mb-2 w-full"

            placeholder="Your Name"

            onChange={(e) => setName(e.target.value)}

          />
<button

            onClick={() => {

              socket.emit("join", name);

              setJoined(true);

            }}

            className="bg-blue-500 text-white px-4 py-2 w-full rounded">

            Join Quiz
</button>
</div>
</div>

    );

  }

  return (
<div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 min-h-screen text-white">

      {q && (
<div className="bg-white text-black p-6 rounded-xl shadow-xl animate-bounce">
<h2 className="text-xl font-bold">{q.question}</h2>
<div className="grid grid-cols-2 gap-4 mt-4">

            {q.options.map((o:string, i:number) => (
<button

                key={i}

                disabled={turn !== name}

                onClick={() => socket.emit("answer", o)}

                className="bg-yellow-300 p-3 rounded shadow hover:scale-105 transition">

                {o}
</button>

            ))}
</div>
<button

            onClick={() => socket.emit("buzz")}

            className="mt-4 bg-red-500 px-4 py-2 rounded w-full">

            BUZZ 🔔
</button>
</div>

      )}
</div>

  );

}
 