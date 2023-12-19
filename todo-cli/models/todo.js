"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      await Todo.printItems(await Todo.overdue());

      console.log("\nDue Today");
      await Todo.printItems(await Todo.dueToday());

      console.log("\nDue Later");
      await Todo.printItems(await Todo.dueLater());
    }

    static async overdue() {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
        },
      });
    }

    static async dueToday() {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: new Date().toISOString().split("T")[0] },
        },
      });
    }

    static async dueLater() {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date().toISOString().split("T")[0] },
        },
      });
    }

    static async markAsComplete(id) {
      return await Todo.update({ completed: true }, { where: { id } });
    }

    static printItems(items) {
      items.forEach((item) => {
        console.log(item.displayableString());
      });
    }

    displayableString() {
      const checkbox = this.completed ? "[x]" : "[ ]";
      const cd = new Date();
      const cds = cd.toISOString().split("T")[0];
      const dateString = this.dueDate === cds ? "" : ` ${this.dueDate}`;
      return `${this.id}. ${checkbox} ${this.title}${dateString}`;
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );

  return Todo;
};
