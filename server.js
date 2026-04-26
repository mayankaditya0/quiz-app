import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname: "0.0.0.0", port: 3000 });
const handle = app.getRequestHandler();

const ADMIN_PASSWORD = "Admin@123";

/** @type {{id:string,name:string,score:number,connected:boolean}[]} */
let students = [];
/** @type {{name:string,questions:{id:string,question:string,options:string[],answerIndex:number}[]} | null} */
let quiz = null;
let quizLaunched = false;
let currentQuestionIndex = -1;
let questionActive = false;
let questionStartAt = 0;
/** @type {{studentId:string,name:string,deltaMs:number,at:number}[]} */
let buzzerAttempts = [];
let quizEnded = false;

const getStudentCount = () => students.filter((s) => s.connected).length;

const leaderboard = () =>
  [...students]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((s) => ({ id: s.id, name: s.name, score: s.score }));

const teacherState = () => ({
  studentCount: getStudentCount(),
  quizName: quiz?.name ?? "",
  totalQuestions: quiz?.questions.length ?? 0,
  quizLaunched,
  currentQuestionIndex,
  questionActive,
  quizEnded,
  buzzerAttempts: [...buzzerAttempts].sort((a, b) => a.deltaMs - b.deltaMs),
  leaderboard: leaderboard(),
  top3: leaderboard().slice(0, 3),
});

const studentState = (studentId) => {
  const me = students.find((s) => s.id === studentId);
  const currentQuestion =
    questionActive && quiz && quiz.questions[currentQuestionIndex]
      ? {
          index: currentQuestionIndex,
          total: quiz.questions.length,
          question: quiz.questions[currentQuestionIndex].question,
          options: quiz.questions[currentQuestionIndex].options,
        }
      : null;

  return {
    quizName: quiz?.name ?? "",
    quizLaunched,
    questionActive,
    quizEnded,
    currentQuestion,
    hasBuzzed: buzzerAttempts.some((b) => b.studentId === studentId),
    myScore: me?.score ?? 0,
  };
};

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const io = new Server(server);

  const emitState = () => {
    io.to("teachers").emit("teacherState", teacherState());
    for (const s of students) {
      if (s.connected) {
        io.to(s.id).emit("studentState", studentState(s.id));
      }
    }
  };

  io.on("connection", (socket) => {
    socket.on("teacherAuth", (password, ack) => {
      if (password === ADMIN_PASSWORD) {
        socket.join("teachers");
        ack?.({ ok: true });
        io.to(socket.id).emit("teacherState", teacherState());
      } else {
        ack?.({ ok: false, message: "Invalid password" });
      }
    });

    socket.on("studentJoin", ({ name }, ack) => {
      const trimmed = (name || "").trim();
      if (!trimmed) {
        ack?.({ ok: false, message: "Name is required" });
        return;
      }

      const existing = students.find((s) => s.id === socket.id);
      if (existing) {
        existing.name = trimmed;
        existing.connected = true;
      } else {
        students.push({ id: socket.id, name: trimmed, score: 0, connected: true });
      }

      ack?.({ ok: true });
      emitState();
    });

    socket.on("teacherSaveQuiz", (payload, ack) => {
      if (!payload?.name?.trim()) {
        ack?.({ ok: false, message: "Quiz name is required" });
        return;
      }

      if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
        ack?.({ ok: false, message: "Add at least one question" });
        return;
      }

      const normalized = payload.questions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        question: String(q.question || "").trim(),
        options: Array.isArray(q.options) ? q.options.map((o) => String(o || "").trim()) : [],
        answerIndex: Number(q.answerIndex),
      }));

      const invalid = normalized.some(
        (q) => !q.question || q.options.length !== 4 || q.options.some((o) => !o) || q.answerIndex < 0 || q.answerIndex > 3,
      );

      if (invalid) {
        ack?.({ ok: false, message: "Each question needs text, 4 options and a valid answer" });
        return;
      }

      quiz = { name: payload.name.trim(), questions: normalized };
      quizLaunched = false;
      quizEnded = false;
      currentQuestionIndex = -1;
      questionActive = false;
      questionStartAt = 0;
      buzzerAttempts = [];
      students = students.map((s) => ({ ...s, score: 0 }));
      ack?.({ ok: true });
      emitState();
    });

    socket.on("teacherLaunchQuiz", (ack) => {
      if (!quiz) {
        ack?.({ ok: false, message: "Create quiz first" });
        return;
      }
      if (getStudentCount() < 1) {
        ack?.({ ok: false, message: "Need at least 1 student to launch" });
        return;
      }

      quizLaunched = true;
      quizEnded = false;
      currentQuestionIndex = -1;
      questionActive = false;
      buzzerAttempts = [];
      students = students.map((s) => ({ ...s, score: 0 }));
      ack?.({ ok: true });
      emitState();
    });

    socket.on("teacherPushQuestion", (ack) => {
      if (!quizLaunched || !quiz) {
        ack?.({ ok: false, message: "Launch quiz first" });
        return;
      }

      if (currentQuestionIndex + 1 >= quiz.questions.length) {
        ack?.({ ok: false, message: "No more questions" });
        return;
      }

      currentQuestionIndex += 1;
      questionActive = true;
      questionStartAt = Date.now();
      buzzerAttempts = [];
      ack?.({ ok: true });
      emitState();
    });

    socket.on("studentBuzz", (ack) => {
      if (!questionActive || !quizLaunched) {
        ack?.({ ok: false, message: "Question is not active" });
        return;
      }

      const student = students.find((s) => s.id === socket.id);
      if (!student || !student.connected) {
        ack?.({ ok: false, message: "Join quiz first" });
        return;
      }

      if (buzzerAttempts.some((b) => b.studentId === socket.id)) {
        ack?.({ ok: false, message: "Already buzzed" });
        return;
      }

      const at = Date.now();
      buzzerAttempts.push({
        studentId: socket.id,
        name: student.name,
        deltaMs: at - questionStartAt,
        at,
      });

      ack?.({ ok: true });
      emitState();
    });

    socket.on("teacherEvaluateAnswer", ({ studentId, isCorrect }, ack) => {
      if (!questionActive) {
        ack?.({ ok: false, message: "No active question" });
        return;
      }

      const student = students.find((s) => s.id === studentId);
      if (!student) {
        ack?.({ ok: false, message: "Student not found" });
        return;
      }

      if (isCorrect) {
        student.score += 10;
        questionActive = false;
      }

      ack?.({ ok: true });
      emitState();
    });

    socket.on("teacherEndQuiz", (ack) => {
      if (!quizLaunched) {
        ack?.({ ok: false, message: "Quiz not launched" });
        return;
      }
      questionActive = false;
      quizEnded = true;
      ack?.({ ok: true });
      emitState();
    });

    socket.on("teacherRestartQuiz", (ack) => {
      quizLaunched = false;
      questionActive = false;
      quizEnded = false;
      currentQuestionIndex = -1;
      buzzerAttempts = [];
      questionStartAt = 0;
      students = students.map((s) => ({ ...s, score: 0 }));
      ack?.({ ok: true });
      emitState();
    });

    socket.on("disconnect", () => {
      const student = students.find((s) => s.id === socket.id);
      if (student) {
        student.connected = false;
      }
      emitState();
    });
  });

  server.listen(3000, "0.0.0.0", () => {
    console.log("Quiz app running on http://0.0.0.0:3000");
  });
});
