const express = require("express");
const app = express();
// const csurf = require("csurf");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const { Todo, User } = require("./models");
const path = require("path");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
app.use(flash());

const salt = 10;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser("sfkdslhhihJHUH"));
// app.use(csurf( { cookie: true } ));
app.use(
  session({
    secret:
      "some random secreat jillsjdpoisivkasfjsdfksddslvskndknldvsknldvsl iamgoinginsanehelppppppppppp",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      try {
        User.findOne({ where: { email: username } })
          .then(async (user) => {
            const revert = await bcrypt.compare(password, user.password);
            if (revert) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Invalid Password" });
            }
          })
          .catch((error) => {
            return error;
          });
      } catch (err) {
        console.log(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(null, error);
    });
});

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.get("/", (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("index");
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const allTodos = await Todo.getTodos();
      if (request.accepts("html")) {
        // const overdue = allTodos.filter(item => item.dueDate < new Date().toISOString().slice(0,10));
        const overdue = [];
        const dueToday = [];
        const dueLater = [];
        const completed = [];

        allTodos.map((item) => {
          if (item.userId === request.user.id) {
            if (item.completed) {
              completed.push(item);
            } else if (item.dueDate < new Date().toISOString().slice(0, 10)) {
              overdue.push(item);
            } else if (item.dueDate > new Date().toISOString().slice(0, 10)) {
              dueLater.push(item);
            } else {
              dueToday.push(item);
            }
          }
        });

        response.render("todos", {
          overdue,
          dueToday,
          dueLater,
          completed,
          allTodos,
        });
      } else {
        response.json({ allTodos });
      }
    } catch (err) {
      console.log(err);
    }
  },
);

// eslint-disable-next-line no-unused-vars
app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("request to fetching all todos");

    try {
      const todo = await Todo.findAll({ order: [["id", "ASC"]] });
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.get(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    // console.log(`creating todo for request: ${request.body}`);
    console.log(request.user.id);
    try {
      const todo = await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        completed: false,
        userId: request.user.id,
      });
      console.log(todo);
      if (request.accepts("html")) {
        return response.redirect("/todos");
      } else {
        return response.json(todo);
      }
    } catch (error) {
      console.log(error);
      request.flash("error", "Failed to add todo. Please try again.");
      return response.redirect("/todos");
    }
  },
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    // console.log(`updating todo with id: ${request.params.id}`);
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updateTodo = await todo.alterCompletion(todo.completed);
      return response.json(updateTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

// eslint-disable-next-line no-unused-vars
app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    try {
      // eslint-disable-next-line no-unused-vars
      const deleteTodo = await Todo.remove(request.params.id);
      return response.json(deleteTodo ? true : false);
    } catch (err) {
      console.log(err);
      return response.status(422).json(err);
    }
  },
);

app.get("/signup", (request, response) => {
  response.render("signup");
});

// eslint-disable-next-line no-unused-vars
app.post("/users", async (request, response) => {
  if (request.body.email.length == 0) {
    request.flash("error", "Email cant empty!");
    return response.redirect("/signup");
  }

  if (request.body.firstName.length == 0) {
    request.flash("error", "First name cant empty!");
    return response.redirect("/signup");
  }
  if (request.body.password.length < 1) {
    request.flash("error", "Password not given");
    return response.redirect("/signup");
  }
  const hashed = await bcrypt.hash(request.body.password, salt);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashed,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
    request.flash("error", "couldnt create user");
  }
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    request.flash("error");
    response.redirect("/todos");
  },
);

app.get("/signout", (request, response, next) => {
  request.logOut((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

module.exports = app;
