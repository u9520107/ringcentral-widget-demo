!function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=826)}({2:function(e,t,n){"use strict";t.__esModule=!0,t.default=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},512:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=n(2),r=function(e){return e&&e.__esModule?e:{default:e}}(o),u=function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=t.prefix;(0,r.default)(this,e),window.addEventListener("load",function(){var e=window.location.href;try{if(window.opener&&window.opener.oAuthCallback)return window.opener.oAuthCallback(e),void window.close()}catch(e){}var t=n+"-redirect-callbackUri";localStorage.removeItem(t),window.addEventListener("storage",function(e){e.key!==t||e.newValue&&""!==e.newValue||window.close()}),localStorage.setItem(t,e)})};t.default=u},826:function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var r=n(512),u=o(r),i=n(89),a=o(i);t.default=new u.default({prefix:a.default})},89:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default="rc-widget"}});