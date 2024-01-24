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
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Shh! It's a secret!"));
app.use(
  session({
    secret: "my-super-secret-key-61835679215613",
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(csurf({ cookie: true }));

app.use(express.static(path.join(__dirname, "public")));

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { email: username } });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const result = await bcrypt.compare(password, user.password);
        if (result) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid password" });
        }
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

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user from session", id);
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.get("/", (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const userId = req.user.id;
    const allTodos = await Todo.getTodos(userId);
    const overdues = await Todo.overDue(userId);
    const duesLater = await Todo.dueLater(userId);
    const duesToday = await Todo.dueToday(userId);
    const completedTodos = await Todo.completedTodos(userId);

    if (req.accepts("html")) {
      res.render("todos", {
        allTodos,
        overdues,
        duesLater,
        duesToday,
        completedTodos,
        csrfToken: req.csrfToken(),
      });
    } else {
      res.json({ allTodos, overdues, duesLater, duesToday, completedTodos });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// ... (other routes)
// ... (other routes)

app.get("/signup", (req, res) => {
  res.render("signup", { csrfToken: req.csrfToken() });
});

app.post("/users", async (req, res) => {
  try {
    if (
      req.body.email.length === 0 ||
      req.body.firstName.length === 0 ||
      req.body.password.length < 2
    ) {
      req.flash("error", "Invalid input. Please provide valid values.");
      return res.redirect("/signup");
    }

    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);
    const user = await User.createUser(req.body, hashedPwd);

    req.login(user, (err) => {
      if (err) {
        return res.status(422).json(err);
      }

      if (req.accepts("html")) {
        return res.redirect("/todos");
      } else {
        return res.json(user);
      }
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Couldn't create user. Please try again.");
    return res.status(422).json(error);
  }
});

app.get("/login", (req, res) => {
  res.render("login", { csrfToken: req.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    console.log(req.user);
    res.redirect("/todos");
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

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/todos", async (req, res) => {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await Todo.findAll();
    return res.json(todos);
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    return res.json(todo);
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log(req.user);
  try {
    if (req.body.title.length === 0 || req.body.dueDate.length === 0) {
      req.flash("error", "Todo title and due date are required.");
      return res.redirect("/todos");
    }

    const todo = await Todo.addTodo(
      req.body.title,
      req.body.dueDate,
      req.user.id,
    );
    if (req.accepts("html")) {
      return res.redirect("/todos");
    } else {
      return res.json(todo);
    }
  } catch (error) {
    console.error(error);
    req.flash("error", "Couldn't create Todo. Please try again.");
    return res.status(422).json(error);
  }
});

app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(
      req.body.completed,
      req.user.id,
    );
    return res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("We have to delete a Todo with ID: ", req.params.id);
    try {
      const delTodo = await Todo.deleteTodo(req.params.id, req.user.id);
      res.send(delTodo ? true : false);
    } catch (error) {
      console.error(error);
      return res.status(422).json(error);
    }
  },
);

module.exports = app;
