__d("TodoFooter",["R5dEk","classNames"],function(t,e,r,n){"use strict";var i=e("R5dEk"),o=e("classNames");r.exports=React.createClass({displayName:"exports",render:function(){var t=i.pluralize(this.props.count,"item"),e=null;this.props.completedCount>0&&(e=React.createElement("button",{className:"clear-completed",onClick:this.props.onClearCompleted},"Clear completed"));var r=this.props.nowShowing;return React.createElement("footer",{className:"footer"},React.createElement("span",{className:"todo-count"},React.createElement("strong",null,this.props.count)," ",t," left"),React.createElement("ul",{className:"filters"},React.createElement("li",null,React.createElement("a",{href:"#/",className:o({selected:r===i.ALL_TODOS})},"All"))," ",React.createElement("li",null,React.createElement("a",{href:"#/active",className:o({selected:r===i.ACTIVE_TODOS})},"Active"))," ",React.createElement("li",null,React.createElement("a",{href:"#/completed",className:o({selected:r===i.COMPLETED_TODOS})},"Completed"))),e)}})});