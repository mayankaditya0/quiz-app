import { Server } from "socket.io";
const io = new Server(3001, {
 cors: { origin: "*" }
});
io.listen(3001);
type Question = {
 question: string;
 options: string[];
 answer: string;
};
const students: Record<string, string> = {};
const leaderboard: Record<string, number> = {};
let quiz: Question[] = [];
let current = 0;
let buzzerQueue: string[] = [];
let locked = false;
io.on("connection", (socket) => {
 socket.on("join", (name: string) => {
   students[socket.id] = name;
   leaderboard[name] = 0;
   io.emit("leaderboard", leaderboard);
 });
 socket.on("createQuiz", (q: Question[]) => quiz = q);
 socket.on("start", () => {
   current = 0;
   io.emit("start");
 });
 socket.on("showQ", () => {
   locked = false;
   buzzerQueue = [];
   io.emit("question", quiz[current]);
 });
 socket.on("buzz", () => {
   if (!buzzerQueue.includes(socket.id)) {
     buzzerQueue.push(socket.id);
     io.emit("buzzList", buzzerQueue.map(id => students[id]));
   }
 });
 socket.on("answer", (ans: string) => {
   if (locked) return;
   const name = students[socket.id];
   if (ans === quiz[current].answer) {
     leaderboard[name] += 10;
     locked = true;
     io.emit("correct", name);
   } else {
     leaderboard[name] -= 5;
   }
   io.emit("leaderboard", leaderboard);
 });
 socket.on("next", () => {
   current++;
   if (current >= quiz.length) {
     io.emit("end", leaderboard);
   }
 });
});
console.log("Socket running on 3001");