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
const bodyParser = require("body-parser");

const { Todo, User } = require("./models");

const saltRounds = 10;

app.set("views", path.join(__dirname, "views"));
app.use(flash());

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
    async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { email: username } });
        const result = await bcrypt.compare(password, user.password);
        return result
          ? done(null, user)
          : done(null, false, { message: "Invalid password" });
      } catch (err) {
        return done(err);
      }
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

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Shh! It's a secret!"));
app.use(csurf({ cookie: true }));

app.use((request, response, next) => {
  response.locals.messages = request.flash();
  next();
});

app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
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
    } catch (error) {
      console.log(error);
      response.status(422).json(error);
    }
  },
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/signup", (request, response) => {
  response.render("signup", { csrfToken: request.csrfToken() });
});

app.post("/users", async (request, response) => {
  if (request.body.email.length === 0) {
    request.flash("error", "Your email is blank! Provide your email");
    return response.redirect("/signup");
  }

  if (request.body.firstName.length === 0) {
    request.flash(
      "error",
      "Your First Name is blank! Provide your First Name!",
    );
    return response.redirect("/signup");
  }
  if (request.body.password.length < 1) {
    request.flash("error", "Your Password must be at least 2 characters long!");
    return response.redirect("/signup");
  }

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
  (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  },
);

app.get("/signout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/", (request, response) => {
  response.send("Hello World");
});

app.get("/todos", async (_request, response) => {
  try {
    const todos = await Todo.findAll();
    response.json(todos);
  } catch (error) {
    console.log(error);
    response.status(422).json(error);
  }
});

app.get("/todos/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    response.json(todo);
  } catch (error) {
    console.log(error);
    response.status(422).json(error);
  }
});

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log(request.user);
    try {
      if (request.body.title.length === 0) {
        request.flash("error", "Your Todo is blank! Provide your Todo");
        return response.redirect("/todos");
      }
      if (request.body.dueDate.length === 0) {
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
  async (request, response) => {
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed,
        request.user.id,
      );
      response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      response.status(422).json(error);
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("We have to delete a Todo with ID: ", request.params.id);

    try {
      const delTodo = await Todo.deleteTodo(request.params.id, request.user.id);
      response.send(delTodo ? true : false);
    } catch (error) {
      console.log(error);
      response.status(422).json(error);
    }
  },
);

module.exports = app;
