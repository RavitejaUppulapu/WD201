let all = [];
const formattedDate = (d) => {
  return d.toISOString().split("T")[0];
};
const todoList = () => {
  all = [];
  let today = new Date();
  today = formattedDate(today).split("-");
  let tyear = today[0];
  let tmonth = today[1];
  let tday = today[2];
  const add = (todoItem) => {
    all.push(todoItem);
  };
  const markAsComplete = (index) => {
    all[index].completed = true;
  };
  const overdue = () => {
    const overdueresult = all.filter((data) => {
      let date = data.dueDate.split("-");
      let y = date[0];
      let m = date[1];
      let d = date[2];

      if (tyear > y) {
        return data;
      } else if (tyear == y) {
        if (tmonth > m) {
          return data;
        } else if (tmonth == m) {
          if (tday > d) {
            return data;
          }
        }
      }
    });
    return overdueresult;
  };

  const dueToday = () => {
    const duetodayresult = all.filter((data) => {
      let date = data.dueDate.split("-");
      let y = date[0];
      let m = date[1];
      let d = date[2];

      if (tyear == y && tmonth == m && tday == d) return data;
    });
    return duetodayresult;
  };

  const dueLater = () => {
    const laterdueresult = all.filter((data) => {
      let date = data.dueDate.split("-");
      let y = date[0];
      let m = date[1];
      let d = date[2];

      if (tyear < y) {
        return data;
      } else if (tyear == y) {
        if (tmonth < m) {
          return data;
        } else if (tmonth == m) {
          if (tday < d) {
            return data;
          }
        }
      }
    });
    return laterdueresult;
  };

  const toDisplayableList = (list) => {
    let data = list.map((item) => {
      let itemdate = item.dueDate.split("-");

      if (itemdate[0] == tyear && itemdate[1] == tmonth && itemdate[2] == tday) {
        if (item.completed) {
          return "[x]" + " " + item.title;
        } else {
          return "[ ]" + " " + item.title;
        }
      } else {
        if (item.completed) {
          return "[X]" + " " + item.title + " " + item.dueDate;
        } else {
          return "[ ]" + " " + item.title + " " + item.dueDate;
        }
      }
    });

    return data.join("\n");
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
