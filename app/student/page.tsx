"use client";
import { useState, useEffect } from "react";
import { getSocket } from "../../lib/socket";
type Question = {
  question: string;
  options: string[];
};

export default function Student() {
 const socket = getSocket();
 const [name, setName] = useState("");
 const [joined, setJoined] = useState(false);
 const [q, setQ] = useState<Question | null>(null);
 useEffect(() => {
   socket.on("question", (data) => {
     setQ(data);
     const audio = new Audio("/sound.mp3");
     audio.play();
   });
 }, []);
 return (
<div className="p-4">
     {!joined ? (
<>
<input onChange={e => setName(e.target.value)} className="border p-2"/>
<button onClick={() => {
           socket.emit("join", name);
           setJoined(true);
         }}>Join</button>
</>
     ) : (
       q && (
<div className="animate-slideUp">
<h2>{q.question}</h2>
<div className="grid grid-cols-2 gap-2">
             {q.options.map((o:string, i:number) => (
<button key={i}
                 className="bg-white p-3 animate-jump"
                 onClick={() => socket.emit("answer", o)}>
                 {o}
</button>
             ))}
</div>
<button onClick={() => socket.emit("buzz")} className="bg-red-500 text-white p-2 mt-4">
             BUZZ
</button>
</div>
       )
     )}
</div>
 );
}