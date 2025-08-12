let todos = [
  {
    id: genId(),
    todoText: "My First Todo",
  },
];

function genId() {
  return new Date().getTime().toString().slice(-6);
}

export async function getTodos() {
  return todos;
}

export async function createTodos(todoText: string) {
  if (!todoText) return Promise.reject("Empty Text");
  todos.push({
    id: genId(),
    todoText: todoText,
  });
}

export async function deleteTodo(id: string) {
  todos = todos.filter((el) => el.id !== id);
}

export async function searchTodo(id: string) {
  const todo = todos.find((el) => el.id === id);
  return todo;
}

export async function updateTodo(id: string, todoTextUpdated: string) {
  if (!todoTextUpdated) return Promise.reject("Empty Text");
  const idx = todos.findIndex((el) => el.id === id);
  if (idx > -1) {
    todos[idx].todoText = todoTextUpdated;
  } else {
    return Promise.reject("Invalid Todo ID");
  }
}

export type Todo = Awaited<ReturnType<typeof getTodos>>[0];
