import "dotenv/config";
import Debug from "debug";
import helmet from "helmet";
import express from "express";
import morgan from "morgan";
import { getTodos, createTodos, deleteTodo, updateTodo } from "./db.js";

const DB_LATENCY = 1000; // ms
const APP_PORT = 3002;

const debug = Debug("app");
const app = express();
app.set("view engine", "pug");
const scriptSources = [
  "'self'",
  "https://unpkg.com",
  "https://cdn.jsdelivr.net",
];
const styleSources = ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"];
const connectSources = ["'self'"];
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: scriptSources,
        scriptSrcElem: scriptSources,
        styleSrc: styleSources,
        connectSrc: connectSources,
      },
      reportOnly: true,
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

// Simulate latency
app.use(function (req, res, next) {
  setTimeout(next, DB_LATENCY);
});

const blankTodo = { id: "", todoText: "" };

app.get("/", async (req, res) => {
  const todos = await getTodos();

  res.render("pages/index", {
    todos: todos,
    mode: "ADD",
    message: "",
    curTodo: blankTodo,
  });
});

app.post("/create", async (req, res) => {
  const todoText = req.body?.todoText ?? "";
  const mode = "ADD";
  try {
    await createTodos(todoText);
    const todos = await getTodos();
    res.render("components/wrapperFormList", {
      todos,
      mode,
      message: "",
      curTodo: blankTodo,
    });
  } catch (err) {
    const todos = await getTodos();
    res.render(`components/wrapperFormList`, {
      todos,
      mode,
      message: err,
      curTodo: blankTodo,
    });
  }

  // * NOTE
  // A more surgical approach would be be trigger only what needs to be updated.
  // res.setHeader("HX-Trigger", "refetchtodo");
  // res.render("inputform", { error: error });
});

app.post("/delete", async (req, res, next) => {
  // console.log(req.body);
  const id = req.body?.curId ?? "";
  const mode = "ADD";
  try {
    await deleteTodo(id);
    const todos = await getTodos();
    res.render("components/wrapperFormList", {
      todos,
      mode,
      message: "",
      curTodo: blankTodo,
    });
  } catch (err) {
    const todos = await getTodos();
    res.render(`components/wrapperFormList`, {
      todos,
      mode,
      message: err,
      curTodo: blankTodo,
    });
  }
});

app.post("/edit", async (req, res) => {
  // console.log(req.body);
  const id = req.body?.curId ?? "";
  try {
    const todos = await getTodos();
    const curTodo = todos.find((el) => el.id === id);
    if (!id || !curTodo) {
      throw new Error("Invalid ID");
    }
    res.render("components/wrapperFormList", {
      todos,
      mode: "EDIT",
      message: "",
      curTodo,
    });
  } catch (err) {
    const todos = await getTodos();
    res.render(`components/wrapperFormList`, {
      todos,
      mode: "ADD",
      message: err,
      curTodo: blankTodo,
    });
  }
});

app.post("/update", async (req, res) => {
  // console.log(req.body);
  const id = req.body?.curId ?? "";
  const todoTextUpdated = req.body?.todoText ?? "";
  console.log({ id, todoTextUpdated });
  try {
    await updateTodo(id, todoTextUpdated);
    const todos = await getTodos();
    res.render("components/wrapperFormList", {
      todos,
      mode: "ADD",
      message: "",
      curTodo: blankTodo,
    });
  } catch (err) {
    const todos = await getTodos();
    let curTodo = todos.find((el) => el.id === id);
    res.render(`components/wrapperFormList`, {
      todos,
      mode: "EDIT",
      message: err,
      curTodo: curTodo ?? blankTodo,
    });
  }
});

app.get("/cancel", async (req, res) => {
  const todos = await getTodos();

  res.render("components/wrapperFormList", {
    todos: todos,
    mode: "ADD",
    message: "",
    curTodo: blankTodo,
  });
});

// Running app
const PORT = process.env.PORT || APP_PORT;
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}`);
  debug(`http://localhost:${PORT}`);
});
