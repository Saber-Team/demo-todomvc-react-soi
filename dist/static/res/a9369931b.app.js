__d("App",["React.Router","TodoFooter","TodoItem","TodoModel","R5dEk"],function(t,e,n,o){"use strict";function i(){ReactDOM.render(React.createElement(u,{model:d}),document.getElementsByClassName("todoapp")[0])}var r=e("React.Router"),s=e("TodoFooter"),a=e("TodoItem"),c=e("TodoModel"),h=e("R5dEk"),l=13,u=React.createClass({displayName:"TodoApp",getInitialState:function(){return{nowShowing:h.ALL_TODOS,editing:null,newTodo:""}},componentDidMount:function(){var t=this.setState,e=r({"/":t.bind(this,{nowShowing:h.ALL_TODOS}),"/active":t.bind(this,{nowShowing:h.ACTIVE_TODOS}),"/completed":t.bind(this,{nowShowing:h.COMPLETED_TODOS})});e.init("/")},handleChange:function(t){this.setState({newTodo:t.target.value})},handleNewTodoKeyDown:function(t){if(t.keyCode===l){t.preventDefault();var e=this.state.newTodo.trim();e&&(this.props.model.addTodo(e),this.setState({newTodo:""}))}},toggleAll:function(t){var e=t.target.checked;this.props.model.toggleAll(e)},toggle:function(t){this.props.model.toggle(t)},destroy:function(t){this.props.model.destroy(t)},edit:function(t){this.setState({editing:t.id})},save:function(t,e){this.props.model.save(t,e),this.setState({editing:null})},cancel:function(){this.setState({editing:null})},clearCompleted:function(){this.props.model.clearCompleted()},render:function(){var t,e,n=this.props.model.todos,o=n.filter(function(t){switch(this.state.nowShowing){case h.ACTIVE_TODOS:return!t.completed;case h.COMPLETED_TODOS:return t.completed;default:return!0}},this),i=o.map(function(t){return React.createElement(a,{key:t.id,todo:t,onToggle:this.toggle.bind(this,t),onDestroy:this.destroy.bind(this,t),onEdit:this.edit.bind(this,t),editing:this.state.editing===t.id,onSave:this.save.bind(this,t),onCancel:this.cancel})},this),r=n.reduce(function(t,e){return e.completed?t:t+1},0),c=n.length-r;return(r||c)&&(t=React.createElement(s,{count:r,completedCount:c,nowShowing:this.state.nowShowing,onClearCompleted:this.clearCompleted})),n.length&&(e=React.createElement("section",{className:"main"},React.createElement("input",{className:"toggle-all",type:"checkbox",onChange:this.toggleAll,checked:0===r}),React.createElement("ul",{className:"todo-list"},i))),React.createElement("div",null,React.createElement("header",{className:"header"},React.createElement("h1",null,"todos"),React.createElement("input",{className:"new-todo",placeholder:"What needs to be done?",value:this.state.newTodo,onKeyDown:this.handleNewTodoKeyDown,onChange:this.handleChange,autoFocus:!0})),e,t)}}),d=new c("react-todos");d.subscribe(i),o.render=i});