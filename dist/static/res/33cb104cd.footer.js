__d("TodoFooter", function(require, exports, module) {
/**
 * @provides TodoFooter
 * @module
 */

/*global React */
'use strict';

var Utils = require('R5dEk');
var classNames = require('classNames');

module.exports = React.createClass({
  displayName: 'exports',

  render: function () {
    var activeTodoWord = Utils.pluralize(this.props.count, 'item');
    var clearButton = null;

    if (this.props.completedCount > 0) {
      clearButton = React.createElement(
        'button',
        {
          className: 'clear-completed',
          onClick: this.props.onClearCompleted },
        'Clear completed'
      );
    }

    var nowShowing = this.props.nowShowing;
    return React.createElement(
      'footer',
      { className: 'footer' },
      React.createElement(
        'span',
        { className: 'todo-count' },
        React.createElement(
          'strong',
          null,
          this.props.count
        ),
        ' ',
        activeTodoWord,
        ' left'
      ),
      React.createElement(
        'ul',
        { className: 'filters' },
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            {
              href: '#/',
              className: classNames({ selected: nowShowing === Utils.ALL_TODOS }) },
            'All'
          )
        ),
        ' ',
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            {
              href: '#/active',
              className: classNames({ selected: nowShowing === Utils.ACTIVE_TODOS }) },
            'Active'
          )
        ),
        ' ',
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            {
              href: '#/completed',
              className: classNames({ selected: nowShowing === Utils.COMPLETED_TODOS }) },
            'Completed'
          )
        )
      ),
      clearButton
    );
  }
});
});