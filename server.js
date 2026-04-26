
import { createServer } from "http";

import next from "next";

import { Server } from "socket.io";

const app = next({ dev: true });

const handle = app.getRequestHandler();

let students = {};

let leaderboard = {};

let quizzes = [];

let activeQuiz = null;

let currentQ = 0;

let buzzerQueue = [];

let locked = false;

let currentResponder = null;

app.prepare().then(() => {

  const server = createServer((req, res) => handle(req, res));

  const io = new Server(server);

  io.on("connection", (socket) => {

    socket.on("join", (name) => {

      students[socket.id] = name;

      leaderboard[name] = 0;

      io.emit("leaderboard", leaderboard);

    });

    socket.on("createQuiz", (quiz) => {

      quizzes.push(quiz);

      io.emit("quizList", quizzes);

    });

    socket.on("selectQuiz", (index) => {

      activeQuiz = quizzes[index];

      currentQ = 0;

    });

    socket.on("showQ", () => {

      if (!activeQuiz) return;

      buzzerQueue = [];

      locked = false;

      currentResponder = null;

      io.emit("question", activeQuiz.questions[currentQ]);

      io.emit("buzzerUpdate", []);

    });

    socket.on("buzz", () => {

      if (!buzzerQueue.includes(socket.id)) {

        buzzerQueue.push(socket.id);

        const list = buzzerQueue.map((id, i) => ({

          name: students[id],

          order: i + 1

        }));

        io.emit("buzzerUpdate", list);

        if (!currentResponder) {

          currentResponder = socket.id;

          io.emit("turn", students[socket.id]);

        }

      }

    });

    socket.on("answer", (ans) => {

      if (locked || !currentResponder) return;

      const correct = activeQuiz.questions[currentQ].answer;

      const name = students[currentResponder];

      if (ans === correct) {

        leaderboard[name] += 10;

        locked = true;

        io.emit("correct", name);

      } else {

        leaderboard[name] -= 5;

        buzzerQueue.shift();

        currentResponder = buzzerQueue[0];

        if (currentResponder) {

          io.emit("turn", students[currentResponder]);

        }

      }

      io.emit("leaderboard", leaderboard);

    });

    socket.on("next", () => {

      currentQ++;

      if (currentQ >= activeQuiz.questions.length) {

        io.emit("end", leaderboard);

      }

    });

  });

  server.listen(3000, "0.0.0.0", () => {

    console.log("🔥 Running on 3000");

  });

});
 