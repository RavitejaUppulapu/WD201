"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }

    static async addTodo(params) {
      return this.create({
        title: params.title,
        dueDate: params.dueDate,
        completed: false,
      });
    }

    static getTodos() {
      return this.findAll();
    }

    static overDue() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          completed: {
            [Op.eq]: false,
          },
        },
      });
    }

    static dueToday() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
          completed: {
            [Op.eq]: false,
          },
        },
      });
    }

    static dueLater() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          completed: {
            [Op.eq]: false,
          },
        },
      });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    setCompletionStatus(status) {
      return this.update({ completed: !status });
    }

    static completedTodos() {
      return this.findAll({
        where: {
          completed: true,
        },
      });
    }

    static async deleteTodo(id) {
      return await Todo.destroy({ where: { id: id } });
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
