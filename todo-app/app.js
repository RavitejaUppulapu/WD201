const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/todos", (req, res) => {
  res.send("Hello");
});

app.post("/todos", async (req, res) => {
  console.log("creating a todo", req.body);
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    return res.json(todo);
  } catch (err) {
    console.log(err);
    console.log("failed to create a todo");
    return res.status(422).json(err);
  }
});

app.put("/todos/:id/markAsCompleted", async (req, res) => {
  console.log(`we have to update a todo with ID ${req.params.id}`);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return res.json(updatedTodo);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.delete("/todos/:id", (req, res) => {
  console.log(`we have to delete a todo with ID ${req.params.id}`);
});

module.exports = app;
