/**
 * @provides App
 * @module
 */

'use strict';

/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React*/
var Router = require('React.Router');
var TodoFooter = require('TodoFooter');
var TodoItem = require('TodoItem');
var TodoModel = require('TodoModel');
var Utils = require('./utils.js');

var ENTER_KEY = 13;

var TodoApp = React.createClass({
  getInitialState: function () {
    return {
      nowShowing: Utils.ALL_TODOS,
      editing: null,
      newTodo: ''
    };
  },

  componentDidMount: function () {
    var setState = this.setState;
    var router = Router({
      '/': setState.bind(this, {nowShowing: Utils.ALL_TODOS}),
      '/active': setState.bind(this, {nowShowing: Utils.ACTIVE_TODOS}),
      '/completed': setState.bind(this, {nowShowing: Utils.COMPLETED_TODOS})
    });
    router.init('/');
  },

  handleChange: function (event) {
    this.setState({newTodo: event.target.value});
  },

  handleNewTodoKeyDown: function (event) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }

    event.preventDefault();

    var val = this.state.newTodo.trim();

    if (val) {
      this.props.model.addTodo(val);
      this.setState({newTodo: ''});
    }
  },

  toggleAll: function (event) {
    var checked = event.target.checked;
    this.props.model.toggleAll(checked);
  },

  toggle: function (todoToToggle) {
    this.props.model.toggle(todoToToggle);
  },

  destroy: function (todo) {
    this.props.model.destroy(todo);
  },

  edit: function (todo) {
    this.setState({editing: todo.id});
  },

  save: function (todoToSave, text) {
    this.props.model.save(todoToSave, text);
    this.setState({editing: null});
  },

  cancel: function () {
    this.setState({editing: null});
  },

  clearCompleted: function () {
    this.props.model.clearCompleted();
  },

  render: function () {
    var footer;
    var main;
    var todos = this.props.model.todos;

    var shownTodos = todos.filter(function (todo) {
      switch (this.state.nowShowing) {
        case Utils.ACTIVE_TODOS:
          return !todo.completed;
        case Utils.COMPLETED_TODOS:
          return todo.completed;
        default:
          return true;
      }
    }, this);

    var todoItems = shownTodos.map(function (todo) {
      return (
          <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={this.toggle.bind(this, todo)}
              onDestroy={this.destroy.bind(this, todo)}
              onEdit={this.edit.bind(this, todo)}
              editing={this.state.editing === todo.id}
              onSave={this.save.bind(this, todo)}
              onCancel={this.cancel}
          />
      );
    }, this);

    var activeTodoCount = todos.reduce(function (accum, todo) {
      return todo.completed ? accum : accum + 1;
    }, 0);

    var completedCount = todos.length - activeTodoCount;

    if (activeTodoCount || completedCount) {
      footer =
          <TodoFooter
              count={activeTodoCount}
              completedCount={completedCount}
              nowShowing={this.state.nowShowing}
              onClearCompleted={this.clearCompleted}
          />;
    }

    if (todos.length) {
      main = (
          <section className="main">
            <input
                className="toggle-all"
                type="checkbox"
                onChange={this.toggleAll}
                checked={activeTodoCount === 0}
            />
            <ul className="todo-list">
              {todoItems}
            </ul>
          </section>
      );
    }

    return (
        <div>
          <header className="header">
            <h1>todos</h1>
            <input
                className="new-todo"
                placeholder="What needs to be done?"
                value={this.state.newTodo}
                onKeyDown={this.handleNewTodoKeyDown}
                onChange={this.handleChange}
                autoFocus={true}
            />
          </header>
          {main}
          {footer}
        </div>
    );
  }
});

var model = new TodoModel('react-todos');

function render() {
  React.render(
      <TodoApp model={model}/>,
      document.getElementsByClassName('todoapp')[0]
  );
}

model.subscribe(render);

exports.render = render;
