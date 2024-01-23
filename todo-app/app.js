const express = require("express");
const app = express();
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Shh! It's a secret!"));
app.use(csurf({ cookie: true }));

app.set("view engine", "ejs");
app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  const overdues = await Todo.overDue();
  const duesLater = await Todo.dueLater();
  const duesToday = await Todo.dueToday();
  const completedTodos = await Todo.completedTodos();

  if (request.accepts("html")) {
    response.render("index", {
      allTodos,
      overdues,
      duesLater,
      duesToday,
      completedTodos,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({ allTodos, overdues, duesLater, duesToday, completedTodos });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (request, response) {
  response.send("Hello World");
});

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE

  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    if (request.accepts("html")) {
      return response.redirect("/");
    } else {
      return response.json(todo);
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE

  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)

  try {
    const delTodo = await Todo.deleteTodo(request.params.id);
    response.send(delTodo ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
