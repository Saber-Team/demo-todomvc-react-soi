__d("R5dEk",[],function(t,e,r,n){"use strict";n.ALL_TODOS="all",n.ACTIVE_TODOS="active",n.COMPLETED_TODOS="completed",n.uuid=function(){var t,e,r="";for(t=0;t<32;t++)e=16*Math.random()|0,8!==t&&12!==t&&16!==t&&20!==t||(r+="-"),r+=(12===t?4:16===t?3&e|8:e).toString(16);return r},n.pluralize=function(t,e){return 1===t?e:e+"s"},n.store=function(t,e){if(e)return localStorage.setItem(t,JSON.stringify(e));var r=localStorage.getItem(t);return r&&JSON.parse(r)||[]},n.extend=function(){for(var t={},e=0;e<arguments.length;e++){var r=arguments[e];for(var n in r)r.hasOwnProperty(n)&&(t[n]=r[n])}return t}});