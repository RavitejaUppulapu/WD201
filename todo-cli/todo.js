const compareDates = (date1, date2) => {
  const [y1, m1, d1] = date1.split("-");
  const [y2, m2, d2] = date2.split("-");
  if (y1 < y2) return -1;
  if (y1 > y2) return 1;
  if (m1 < m2) return -1;
  if (m1 > m2) return 1;
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

// A helper function to format a date as YYYY-MM-DD
const formattedDate = (d) => {
  return d.toISOString().split("T")[0];
};

const todoList = () => {
  let all = [];
  let today = formattedDate(new Date());

  const add = (todoItem) => {
    all.push(todoItem);
  };

  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  // Use the compareDates function to filter the tasks by due date
  const overdue = () => {
    return all.filter((data) => compareDates(data.dueDate, today) < 0);
  };

  const dueToday = () => {
    return all.filter((data) => compareDates(data.dueDate, today) === 0);
  };

  const dueLater = () => {
    return all.filter((data) => compareDates(data.dueDate, today) > 0);
  };

  // Use a ternary operator to simplify the logic of displaying the tasks
  const toDisplayableList = (list) => {
    return list
      .map((item) => {
        const check = item.completed ? "[X]" : "[ ]";
        const date =
          compareDates(item.dueDate, today) === 0 ? "" : item.dueDate;
        return `${check} ${item.title} ${date}`.trim();
      })
      .join("\n");
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};

// ####################################### #
// DO NOT CHANGE ANYTHING BELOW THIS LINE. #
// ####################################### #

const todos = todoList();

var dateToday = new Date();
const today = formattedDate(dateToday);
const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1))
);
const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1))
);

todos.add({ title: "Submit assignment", dueDate: yesterday, completed: false });
todos.add({ title: "Pay rent", dueDate: today, completed: true });
todos.add({ title: "Service Vehicle", dueDate: today, completed: false });
todos.add({ title: "File taxes", dueDate: tomorrow, completed: false });
todos.add({ title: "Pay electric bill", dueDate: tomorrow, completed: false });

console.log("My Todo-list\n");

console.log("Overdue");
var overdues = todos.overdue();
var formattedOverdues = todos.toDisplayableList(overdues);
console.log(formattedOverdues);
console.log("\n");

console.log("Due Today");
let itemsDueToday = todos.dueToday();
let formattedItemsDueToday = todos.toDisplayableList(itemsDueToday);
console.log(formattedItemsDueToday);
console.log("\n");

console.log("Due Later");
let itemsDueLater = todos.dueLater();
let formattedItemsDueLater = todos.toDisplayableList(itemsDueLater);
console.log(formattedItemsDueLater);
console.log("\n\n");

module.exports = todoList;
