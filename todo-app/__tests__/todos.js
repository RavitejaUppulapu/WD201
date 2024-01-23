const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo with the given ID as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    // const parsedResponse = JSON.parse(response.text);
    // const todoID = parsedResponse.id;

    // expect(parsedResponse.completed).toBe(false);

    // const markCompleteResponse = await agent
    //   .put(`/todos/${todoID}/markASCompleted`)
    //   .send();
    // const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    // expect(parsedUpdateResponse.completed).toBe(true);

    const groupedTodosResponce = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedTodosResponce = JSON.parse(groupedTodosResponce.text);
    const dueTodayCount = parsedGroupedTodosResponce.duesToday.length;
    const latestTodo = parsedGroupedTodosResponce.duesToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
      });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const allTodosCount = await db.Todo.count();
    const response = await agent.get("/todos");
    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.length).toBe(allTodosCount);
    expect(parsedResponse.length).toBe(4);
    expect(parsedResponse[allTodosCount - 1]["title"]).toBe("Buy ps3");
  });

  // test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
  //   // FILL IN YOUR CODE HERE
  //   let res = await agent.get("/");
  //   let csrfToken = extractCsrfToken(res);
  //   const response = await agent
  //     .post("/todos")
  //     .set("Accept", "application/json")
  //     .send({
  //       title: "Buy milk",
  //       dueDate: new Date().toISOString(),
  //       completed: false,
  //       _csrf: csrfToken,
  //     });

  //   expect(response.statusCode).toBe(200);
  //   expect(response.header["content-type"]).toMatch("application/json");

  //   const parsedResponse = JSON.parse(response.text);
  //   const todoId = parsedResponse.id;
  //   expect(parsedResponse.id).toBeDefined();
  //   const deleteResponse = await agent.delete(`/todos/${todoId}`).send();
  //   expect(deleteResponse.statusCode).toBe(200);
  //   const parsedDeleteResponse = JSON.parse(deleteResponse.text);
  //   expect(parsedDeleteResponse).toBe(true);
  // });
});
