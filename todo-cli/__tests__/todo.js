const todoList = require("../todo");

const {
  all,
  markAsComplete,
  add,
  overdue,
  dueToday,
  dueLater,
  toDisplayableList,
} = todoList();

describe("Todolist test Suite", () => {
  beforeAll(() => {
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString("en-CA"),
    });
  });

  test("Should add new todo", () => {
    const todoItemsCount = all.length;
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString("en-CA"),
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("Should filter and return overdue todos", () => {
    // Assuming the dueDate is set to the previous date
    add({
      title: "Overdue todo",
      completed: false,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString("en-CA"),
    });
    const overdueList = overdue();
    expect(overdueList.length).toBe(1);
    expect(toDisplayableList(overdueList)).toContain("[ ] Overdue todo");
  });

  test("Should filter and return todos due today", () => {
    // Assuming the dueDate is set to the current date
    add({
      title: "Due today todo",
      completed: false,
      dueDate: new Date().toISOString("en-CA").split("T")[0],
    });
    const todayList = dueToday();
    expect(todayList.length).toBe(1);
    expect(toDisplayableList(todayList)).toContain("[ ] Due today todo");
  });

  test("Should filter and return todos due later", () => {
    // Assuming the dueDate is set to a future date
    add({
      title: "Due later todo",
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(
        "en-CA",
      ),
    });
    const laterList = dueLater();

    console.log("Later List:", laterList); // Add this line for debugging

    // Filter the list to include only "Due later todo" items
    const filteredLaterList = laterList.filter(
      (item) => item.title === "Due later todo",
    );

    expect(filteredLaterList.length).toBe(1);
    expect(toDisplayableList(filteredLaterList)).toContain(
      "[ ] Due later todo",
    );
  });
});

// const todoList = require("../todo");

// const {
//   all,
//   markAsComplete,
//   add,
//   overdue,
//   dueToday,
//   dueLater
// } = todoList();

// describe("Todolist test Suite", () => {
//   beforeAll(() => {
//     add({
//       title: "Test todo",
//       completed: false,
//       dueDate: new Date().toISOString("en-CA"),
//     });
//   });
//   test("Should add new todo", () => {
//     const todoItemsCount = all.length;
//     add({
//       title: "Test todo",
//       completed: false,
//       dueDate: new Date().toISOString("en-CA"),
//     });
//     expect(all.length).toBe(todoItemsCount + 1);
//   });

//   test("Should mark a todo as complete", () => {
//     expect(all[0].completed).toBe(false); // Fix the typo here
//     markAsComplete(0);
//     expect(all[0].completed).toBe(true);
//   });

// });
