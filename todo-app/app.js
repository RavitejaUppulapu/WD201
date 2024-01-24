const express = require("express");
const app = express();
const csurf = require("csurf");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(flash());

const saltRounds = 10;

app.use(
  session({
    secret: "my-super-secret-key-61835679215613",
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async function (user) {
          if (!user) {
            return done(null, false, { message: "Invalid email" });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((err) => {
          console.log(err);
          flash("error", "Couldn't Login, Please try again!");
          return done(err);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log("Deserializing user from session", id);
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
//const user = require("./models/user");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Shh! It's a secret!"));
app.use(csurf({ cookie: true }));

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.set("view engine", "ejs");
app.get("/", async (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const allTodos = await Todo.getTodos(request.user.id);
    const overdues = await Todo.overDue(request.user.id);
    const duesLater = await Todo.dueLater(request.user.id);
    const duesToday = await Todo.dueToday(request.user.id);
    const completedTodos = await Todo.completedTodos(request.user.id);

    if (request.accepts("html")) {
      response.render("todos", {
        allTodos,
        overdues,
        duesLater,
        duesToday,
        completedTodos,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        allTodos,
        overdues,
        duesLater,
        duesToday,
        completedTodos,
      });
    }
  },
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/signup", function (request, response) {
  response.render("signup", { csrfToken: request.csrfToken() });
});

app.post("/users", async function (request, response) {
  if (request.body.email.length == 0) {
    request.flash("error", "Your email is blank! Provide your email");
    return response.redirect("/signup");
  }

  if (request.body.firstName.length == 0) {
    request.flash(
      "error",
      "Your First Name is blank! Provide your First Name!",
    );
    return response.redirect("/signup");
  }
  if (request.body.password.length < 1) {
    request.flash("error", "Your Password must be atleast 2 characters long!");
    return response.redirect("/signup");
  }
  console.log(
    request.body.firstName,
    request.body.lastName,
    request.body.email,
    request.body.password,
  );
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const user = await User.createUser(request.body, hashedPwd);
    request.login(user, (err) => {
      if (err) {
        return response.status(422).json(err);
      }
      if (request.accepts("html")) {
        return response.redirect("/todos");
      } else {
        return response.json(user);
      }
    });
  } catch (error) {
    console.log(error);
    request.flash("error", "Couldn't Create user, Please try again!");
    return response.status(422).json(error);
  }
});

app.get("/login", (request, response) => {
  response.render("login", { csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    try {
      console.log(request.user);
      response.redirect("/todos");
    } catch (error) {
      console.log(error);
      request.flash("error", "Couldn't Login, Please try again!");
      return response.status(422).json(error);
    }
  },
);

app.get("/signout", function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

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

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log(request.user);
    try {
      if (request.body.title.length == 0) {
        request.flash("error", "Your Todo is blank! Provide your Todo");
        return response.redirect("/todos");
      }
      if (request.body.dueDate.length == 0) {
        request.flash("error", "Your Todo is blank! Provide your Todo");
        return response.redirect("/todos");
      }
      const todo = await Todo.addTodo(
        request.body.title,
        request.body.dueDate,
        request.user.id,
      );
      if (request.accepts("html")) {
        return response.redirect("/todos");
      } else {
        return response.json(todo);
      }
    } catch (error) {
      console.log(error);
      request.flash("error", "Couldn't Create Todo, Please try again!");
      return response.status(422).json(error);
    }
  },
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed,
        request.user.id,
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    // FILL IN YOUR CODE HERE

    // First, we have to query our database to delete a Todo by ID.
    // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
    // response.send(true)

    try {
      const delTodo = await Todo.deleteTodo(request.params.id, request.user.id);
      response.send(delTodo ? true : false);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

module.exports = app;
