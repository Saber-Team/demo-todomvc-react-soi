__d("TodoModel",["R5dEk"],function(t,e,n,i){"use strict";var r=e("R5dEk"),o=n.exports=function(t){this.key=t,this.todos=r.store(t),this.onChanges=[]};o.prototype.subscribe=function(t){this.onChanges.push(t)},o.prototype.inform=function(){r.store(this.key,this.todos),this.onChanges.forEach(function(t){t()})},o.prototype.addTodo=function(t){this.todos=this.todos.concat({id:r.uuid(),title:t,completed:!1}),this.inform()},o.prototype.toggleAll=function(t){this.todos=this.todos.map(function(e){return r.extend({},e,{completed:t})}),this.inform()},o.prototype.toggle=function(t){this.todos=this.todos.map(function(e){return e!==t?e:r.extend({},e,{completed:!e.completed})}),this.inform()},o.prototype.destroy=function(t){this.todos=this.todos.filter(function(e){return e!==t}),this.inform()},o.prototype.save=function(t,e){this.todos=this.todos.map(function(n){return n!==t?n:r.extend({},n,{title:e})}),this.inform()},o.prototype.clearCompleted=function(){this.todos=this.todos.filter(function(t){return!t.completed}),this.inform()}});