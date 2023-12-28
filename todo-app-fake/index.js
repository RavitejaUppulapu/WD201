const express = require("express");
const app = express();
const {Todo} = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());




app.get("/todos", (req, res) => {
  console.log("Todo list");
});

  
app.post("/todos", async (req, res) => {
  console.log("creating a todo", req.body);
  try {
    const todo = await Todo.create({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });

    return res.json(todo);
  } catch (err) {
    console.log(err);
    console.log("fialed to create a todo");
    return res.status(422).json(err);
  }
});



app.post("/todos/:id/markAsCompleted", (req, res) => {
  console.log(`we have to update a todo with ID ${req.params.id}`);
});

app.delete("/todos/:id", (req, res) => {
  console.log(`we have to delete a todo with ID ${req.params.id}`);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
