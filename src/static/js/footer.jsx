/**
 * @provides TodoFooter
 * @module
 */

/*global React */
'use strict';

var Utils = require('./utils');
var classNames = require('classNames');

module.exports = React.createClass({
    render: function () {
        var activeTodoWord = Utils.pluralize(this.props.count, 'item');
        var clearButton = null;

        if (this.props.completedCount > 0) {
            clearButton = (
                <button
                    className="clear-completed"
                    onClick={this.props.onClearCompleted}>
                    Clear completed
                </button>
            );
        }

        var nowShowing = this.props.nowShowing;
        return (
            <footer className="footer">
                <span className="todo-count">
                    <strong>{this.props.count}</strong> {activeTodoWord} left
                </span>
                <ul className="filters">
                    <li>
                        <a
                            href="#/"
                            className={classNames({selected: nowShowing === Utils.ALL_TODOS})}>
                            All
                        </a>
                    </li>
            {' '}
                    <li>
                        <a
                            href="#/active"
                            className={classNames({selected: nowShowing === Utils.ACTIVE_TODOS})}>
                            Active
                        </a>
                    </li>
            {' '}
                    <li>
                        <a
                            href="#/completed"
                            className={classNames({selected: nowShowing === Utils.COMPLETED_TODOS})}>
                            Completed
                        </a>
                    </li>
                </ul>
          {clearButton}
            </footer>
        );
    }
});
