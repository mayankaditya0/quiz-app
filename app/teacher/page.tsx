"use client";
import { useState, useEffect } from "react";
import { getSocket } from "../../lib/socket";
export default function Teacher() {
 const socket = getSocket();
 const [auth, setAuth] = useState(false);
 const [lb, setLb] = useState<Record<string, number>>({});
 useEffect(() => {
   socket.on("leaderboard", setLb);
 }, []);
 const quiz = [
   {
     question: "Capital of India?",
     options: ["Delhi","Mumbai","Chennai","Kolkata"],
     answer: "Delhi"
   }
 ];
 return (
<div className="p-4">
     {!auth ? (
<button onClick={() => {
         const u = prompt("user");
         const p = prompt("pass");
         if(u==="Admin" && p==="Admin123@Maa") setAuth(true);
       }}>Login</button>
     ) : (
<>
<button onClick={()=>socket.emit("createQuiz",quiz)}>Load</button>
<button onClick={()=>socket.emit("start")}>Start</button>
<button onClick={()=>socket.emit("showQ")}>Show Q</button>
<button onClick={()=>socket.emit("next")}>Next</button>
<h2>Leaderboard</h2>
         {Object.entries(lb)
           .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
           .map(([n, s]: [string, number], i: number) => (
<div key={n}>
               {i+1}. {n} - {s}
</div>
         ))}
</>
     )}
</div>
 );
}