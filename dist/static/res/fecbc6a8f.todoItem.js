__d("TodoItem",function(e,t,n){"use strict";var r=e("classNames"),o=27,i=13;n.exports=React.createClass({displayName:"exports",handleSubmit:function(e){var t=this.state.editText.trim();t?(this.props.onSave(t),this.setState({editText:t})):this.props.onDestroy()},handleEdit:function(){this.props.onEdit(),this.setState({editText:this.props.todo.title})},handleKeyDown:function(e){e.which===o?(this.setState({editText:this.props.todo.title}),this.props.onCancel(e)):e.which===i&&this.handleSubmit(e)},handleChange:function(e){this.props.editing&&this.setState({editText:e.target.value})},getInitialState:function(){return{editText:this.props.todo.title}},shouldComponentUpdate:function(e,t){return e.todo!==this.props.todo||e.editing!==this.props.editing||t.editText!==this.state.editText},componentDidUpdate:function(e){if(!e.editing&&this.props.editing){var t=React.findDOMNode(this.refs.editField);t.focus(),t.setSelectionRange(t.value.length,t.value.length)}},render:function(){return React.createElement("li",{className:r({completed:this.props.todo.completed,editing:this.props.editing})},React.createElement("div",{className:"view"},React.createElement("input",{className:"toggle",type:"checkbox",checked:this.props.todo.completed,onChange:this.props.onToggle}),React.createElement("label",{onDoubleClick:this.handleEdit},this.props.todo.title),React.createElement("button",{className:"destroy",onClick:this.props.onDestroy})),React.createElement("input",{ref:"editField",className:"edit",value:this.state.editText,onBlur:this.handleSubmit,onChange:this.handleChange,onKeyDown:this.handleKeyDown}))}})});