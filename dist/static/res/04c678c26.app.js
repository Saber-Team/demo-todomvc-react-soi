kerneljs.exec("App",function(e,t,n){"use strict";function r(){React.render(React.createElement(l,{model:p}),document.getElementsByClassName("todoapp")[0])}var o=e("React.Router"),i=e("TodoFooter"),a=e("TodoItem"),s=e("TodoModel"),u=e("R5dEk"),c=13,l=React.createClass({displayName:"TodoApp",getInitialState:function(){return{nowShowing:u.ALL_TODOS,editing:null,newTodo:""}},componentDidMount:function(){var e=this.setState,t=o({"/":e.bind(this,{nowShowing:u.ALL_TODOS}),"/active":e.bind(this,{nowShowing:u.ACTIVE_TODOS}),"/completed":e.bind(this,{nowShowing:u.COMPLETED_TODOS})});t.init("/")},handleChange:function(e){this.setState({newTodo:e.target.value})},handleNewTodoKeyDown:function(e){if(e.keyCode===c){e.preventDefault();var t=this.state.newTodo.trim();t&&(this.props.model.addTodo(t),this.setState({newTodo:""}))}},toggleAll:function(e){var t=e.target.checked;this.props.model.toggleAll(t)},toggle:function(e){this.props.model.toggle(e)},destroy:function(e){this.props.model.destroy(e)},edit:function(e){this.setState({editing:e.id})},save:function(e,t){this.props.model.save(e,t),this.setState({editing:null})},cancel:function(){this.setState({editing:null})},clearCompleted:function(){this.props.model.clearCompleted()},render:function(){var e,t,n=this.props.model.todos,r=n.filter(function(e){switch(this.state.nowShowing){case u.ACTIVE_TODOS:return!e.completed;case u.COMPLETED_TODOS:return e.completed;default:return!0}},this),o=r.map(function(e){return React.createElement(a,{key:e.id,todo:e,onToggle:this.toggle.bind(this,e),onDestroy:this.destroy.bind(this,e),onEdit:this.edit.bind(this,e),editing:this.state.editing===e.id,onSave:this.save.bind(this,e),onCancel:this.cancel})},this),s=n.reduce(function(e,t){return t.completed?e:e+1},0),c=n.length-s;return(s||c)&&(e=React.createElement(i,{count:s,completedCount:c,nowShowing:this.state.nowShowing,onClearCompleted:this.clearCompleted})),n.length&&(t=React.createElement("section",{className:"main"},React.createElement("input",{className:"toggle-all",type:"checkbox",onChange:this.toggleAll,checked:0===s}),React.createElement("ul",{className:"todo-list"},o))),React.createElement("div",null,React.createElement("header",{className:"header"},React.createElement("h1",null,"todos"),React.createElement("input",{className:"new-todo",placeholder:"What needs to be done?",value:this.state.newTodo,onKeyDown:this.handleNewTodoKeyDown,onChange:this.handleChange,autoFocus:!0})),t,e)}}),p=new s("react-todos");p.subscribe(r),r()});