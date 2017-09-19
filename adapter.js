/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 815);
/******/ })
/************************************************************************/
/******/ ({

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(302);

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list, options);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list, options) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove, transformResult;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    transformResult = options.transform(obj.css);
	    
	    if (transformResult) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = transformResult;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css. 
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 104:
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(213), __esModule: true };

/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
			return classNames;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {
		window.classNames = classNames;
	}
}());


/***/ }),

/***/ 125:
/***/ (function(module, exports) {

module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};

/***/ }),

/***/ 127:
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(53)
  , document = __webpack_require__(41).document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};

/***/ }),

/***/ 130:
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(53);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};

/***/ }),

/***/ 154:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  id: '1210',
  brandCode: 'rc',
  name: 'RingCentral',
  appName: 'RingCentral Widget Demo',
  fullName: 'RingCentral'
};

/***/ }),

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(42) && !__webpack_require__(63)(function(){
  return Object.defineProperty(__webpack_require__(127)('div'), 'a', {get: function(){ return 7; }}).a != 7;
});

/***/ }),

/***/ 1839:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(336);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(10)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--7-1!../../../node_modules/postcss-loader/index.js??ref--7-2!../../../node_modules/sass-loader/lib/loader.js??ref--7-3!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js??ref--7-1!../../../node_modules/postcss-loader/index.js??ref--7-2!../../../node_modules/sass-loader/lib/loader.js??ref--7-3!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/***/ }),

/***/ 213:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(227);
var $Object = __webpack_require__(34).Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};

/***/ }),

/***/ 227:
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(43);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(42), 'Object', {defineProperty: __webpack_require__(48).f});

/***/ }),

/***/ 233:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)(undefined);
// imports


// module
exports.push([module.i, "/*! normalize.css v2.1.3 | MIT License | git.io/normalize */\n\n/* ==========================================================================\n   HTML5 display definitions\n   ========================================================================== */\n\n/**\n * Correct `block` display not defined in IE 8/9.\n */\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nnav,\nsection,\nsummary {\n    display: block;\n}\n\n/**\n * Correct `inline-block` display not defined in IE 8/9.\n */\n\naudio,\ncanvas,\nvideo {\n    display: inline-block;\n}\n\n/**\n * Prevent modern browsers from displaying `audio` without controls.\n * Remove excess height in iOS 5 devices.\n */\n\naudio:not([controls]) {\n    display: none;\n    height: 0;\n}\n\n/**\n * Address `[hidden]` styling not present in IE 8/9.\n * Hide the `template` element in IE, Safari, and Firefox < 22.\n */\n\n[hidden],\ntemplate {\n    display: none;\n}\n\n/* ==========================================================================\n   Base\n   ========================================================================== */\n\n/**\n * 1. Set default font family to sans-serif.\n * 2. Prevent iOS text size adjust after orientation change, without disabling\n *    user zoom.\n */\n\nhtml {\n    font-family: sans-serif; /* 1 */\n    -ms-text-size-adjust: 100%; /* 2 */\n    -webkit-text-size-adjust: 100%; /* 2 */\n}\n\n/**\n * Remove default margin.\n */\n\nbody {\n    margin: 0;\n}\n\n/* ==========================================================================\n   Links\n   ========================================================================== */\n\n/**\n * Remove the gray background color from active links in IE 10.\n */\n\na {\n    background: transparent;\n}\n\n/**\n * Address `outline` inconsistency between Chrome and other browsers.\n */\n\na:focus {\n    outline: thin dotted;\n}\n\n/**\n * Improve readability when focused and also mouse hovered in all browsers.\n */\n\na:active,\na:hover {\n    outline: 0;\n}\n\n/* ==========================================================================\n   Typography\n   ========================================================================== */\n\n/**\n * Address variable `h1` font-size and margin within `section` and `article`\n * contexts in Firefox 4+, Safari 5, and Chrome.\n */\n\nh1 {\n    font-size: 2em;\n    margin: 0.67em 0;\n}\n\n/**\n * Address styling not present in IE 8/9, Safari 5, and Chrome.\n */\n\nabbr[title] {\n    border-bottom: 1px dotted;\n}\n\n/**\n * Address style set to `bolder` in Firefox 4+, Safari 5, and Chrome.\n */\n\nb,\nstrong {\n    font-weight: bold;\n}\n\n/**\n * Address styling not present in Safari 5 and Chrome.\n */\n\ndfn {\n    font-style: italic;\n}\n\n/**\n * Address differences between Firefox and other browsers.\n */\n\nhr {\n    -moz-box-sizing: content-box;\n    box-sizing: content-box;\n    height: 0;\n}\n\n/**\n * Address styling not present in IE 8/9.\n */\n\nmark {\n    background: #ff0;\n    color: #000;\n}\n\n/**\n * Correct font family set oddly in Safari 5 and Chrome.\n */\n\ncode,\nkbd,\npre,\nsamp {\n    font-family: monospace, serif;\n    font-size: 1em;\n}\n\n/**\n * Improve readability of pre-formatted text in all browsers.\n */\n\npre {\n    white-space: pre-wrap;\n}\n\n/**\n * Set consistent quote types.\n */\n\nq {\n    quotes: \"\\201C\" \"\\201D\" \"\\2018\" \"\\2019\";\n}\n\n/**\n * Address inconsistent and variable font size in all browsers.\n */\n\nsmall {\n    font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` affecting `line-height` in all browsers.\n */\n\nsub,\nsup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n}\n\nsup {\n    top: -0.5em;\n}\n\nsub {\n    bottom: -0.25em;\n}\n\n/* ==========================================================================\n   Embedded content\n   ========================================================================== */\n\n/**\n * Remove border when inside `a` element in IE 8/9.\n */\n\nimg {\n    border: 0;\n}\n\n/**\n * Correct overflow displayed oddly in IE 9.\n */\n\nsvg:not(:root) {\n    overflow: hidden;\n}\n\n/* ==========================================================================\n   Figures\n   ========================================================================== */\n\n/**\n * Address margin not present in IE 8/9 and Safari 5.\n */\n\nfigure {\n    margin: 0;\n}\n\n/* ==========================================================================\n   Forms\n   ========================================================================== */\n\n/**\n * Define consistent border, margin, and padding.\n */\n\nfieldset {\n    border: 1px solid #c0c0c0;\n    margin: 0 2px;\n    padding: 0.35em 0.625em 0.75em;\n}\n\n/**\n * 1. Correct `color` not being inherited in IE 8/9.\n * 2. Remove padding so people aren't caught out if they zero out fieldsets.\n */\n\nlegend {\n    border: 0; /* 1 */\n    padding: 0; /* 2 */\n}\n\n/**\n * 1. Correct font family not being inherited in all browsers.\n * 2. Correct font size not being inherited in all browsers.\n * 3. Address margins set differently in Firefox 4+, Safari 5, and Chrome.\n */\n\nbutton,\ninput,\nselect,\ntextarea {\n    font-family: inherit; /* 1 */\n    font-size: 100%; /* 2 */\n    margin: 0; /* 3 */\n}\n\n/**\n * Address Firefox 4+ setting `line-height` on `input` using `!important` in\n * the UA stylesheet.\n */\n\nbutton,\ninput {\n    line-height: normal;\n}\n\n/**\n * Address inconsistent `text-transform` inheritance for `button` and `select`.\n * All other form control elements do not inherit `text-transform` values.\n * Correct `button` style inheritance in Chrome, Safari 5+, and IE 8+.\n * Correct `select` style inheritance in Firefox 4+ and Opera.\n */\n\nbutton,\nselect {\n    text-transform: none;\n}\n\n/**\n * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native `audio`\n *    and `video` controls.\n * 2. Correct inability to style clickable `input` types in iOS.\n * 3. Improve usability and consistency of cursor style between image-type\n *    `input` and others.\n */\n\nbutton,\nhtml input[type=\"button\"], /* 1 */\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n    -webkit-appearance: button; /* 2 */\n    cursor: pointer; /* 3 */\n}\n\n/**\n * Re-set default cursor for disabled elements.\n */\n\nbutton[disabled],\nhtml input[disabled] {\n    cursor: default;\n}\n\n/**\n * 1. Address box sizing set to `content-box` in IE 8/9/10.\n * 2. Remove excess padding in IE 8/9/10.\n */\n\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n    box-sizing: border-box; /* 1 */\n    padding: 0; /* 2 */\n}\n\n/**\n * 1. Address `appearance` set to `searchfield` in Safari 5 and Chrome.\n * 2. Address `box-sizing` set to `border-box` in Safari 5 and Chrome\n *    (include `-moz` to future-proof).\n */\n\ninput[type=\"search\"] {\n    -webkit-appearance: textfield; /* 1 */\n    -moz-box-sizing: content-box;\n    -webkit-box-sizing: content-box; /* 2 */\n    box-sizing: content-box;\n}\n\n/**\n * Remove inner padding and search cancel button in Safari 5 and Chrome\n * on OS X.\n */\n\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n    -webkit-appearance: none;\n}\n\n/**\n * Remove inner padding and border in Firefox 4+.\n */\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n    border: 0;\n    padding: 0;\n}\n\n/**\n * 1. Remove default vertical scrollbar in IE 8/9.\n * 2. Improve readability and alignment in all browsers.\n */\n\ntextarea {\n    overflow: auto; /* 1 */\n    vertical-align: top; /* 2 */\n}\n\n/* ==========================================================================\n   Tables\n   ========================================================================== */\n\n/**\n * Remove most spacing between table cells.\n */\n\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n}\n", ""]);

// exports


/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__(104);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/***/ }),

/***/ 302:
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ 336:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)(undefined);
// imports
exports.i(__webpack_require__(233), "");

// module
exports.push([module.i, ".src-modules-Adapter-_styles_centerStyle_sgBYm, .src-modules-Adapter-_styles_logo_1hTLP, .src-modules-Adapter-_styles_presence_2ZaL0, .src-modules-Adapter-_styles_button_2cUDM {\n  top: 50%;\n  position: absolute;\n}\n\n.src-modules-Adapter-_styles_root_319lO {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  user-drag: none;\n  box-sizing: border-box;\n  padding: 0;\n  border-radius: 3px;\n  position: fixed;\n  display: block;\n  visibility: visible;\n  bottom: 0;\n  left: 0;\n  background-color: #f3f3f3;\n  transition: visibility 0.2 0s, opacity 0.2s 0s linear, -webkit-transform 0.1s 0s ease-in-out;\n  transition: visibility 0.2 0s, opacity 0.2s 0s linear, transform 0.1s 0s ease-in-out;\n  transition: visibility 0.2 0s, opacity 0.2s 0s linear, transform 0.1s 0s ease-in-out, -webkit-transform 0.1s 0s ease-in-out;\n  z-index: 9999;\n  box-shadow: 0px 0px 5px 1px #bec5d0;\n}\n\n.src-modules-Adapter-_styles_root_319lO.src-modules-Adapter-_styles_dragging_1VCye {\n  transition: opacity 0.1s 0s linear;\n}\n\n.src-modules-Adapter-_styles_root_319lO.src-modules-Adapter-_styles_closed_1J5E5,\n.src-modules-Adapter-_styles_root_319lO.src-modules-Adapter-_styles_loading_hdZTQ {\n  visibility: hidden;\n  opacity: 0;\n}\n\n.src-modules-Adapter-_styles_root_319lO .src-modules-Adapter-_styles_header_1a8xP {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  user-drag: none;\n  position: relative;\n  height: 44px !important;\n  line-height: 44px !important;\n  min-width: 165px;\n  text-align: center;\n  cursor: move;\n  z-index: 11;\n}\n\n.src-modules-Adapter-_styles_minimized_2g4Fc .src-modules-Adapter-_styles_header_1a8xP {\n  cursor: ew-resize;\n}\n\n@-webkit-keyframes src-modules-Adapter-_styles_sparkle_1cBlF {\n  from {\n    background-color: inherit;\n  }\n  to {\n    background-color: #add2e3;\n  }\n}\n\n@keyframes src-modules-Adapter-_styles_sparkle_1cBlF {\n  from {\n    background-color: inherit;\n  }\n  to {\n    background-color: #add2e3;\n  }\n}\n\n.src-modules-Adapter-_styles_minimized_2g4Fc.src-modules-Adapter-_styles_ringing_3BzK_ .src-modules-Adapter-_styles_header_1a8xP {\n  -webkit-animation-name: src-modules-Adapter-_styles_sparkle_1cBlF;\n          animation-name: src-modules-Adapter-_styles_sparkle_1cBlF;\n  -webkit-animation-duration: 0.45s;\n          animation-duration: 0.45s;\n  -webkit-animation-iteration-count: infinite;\n          animation-iteration-count: infinite;\n  -webkit-animation-direction: alternate;\n          animation-direction: alternate;\n  -webkit-animation-timing-function: ease-in-out;\n          animation-timing-function: ease-in-out;\n}\n\n.src-modules-Adapter-_styles_logo_1hTLP {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  user-drag: none;\n  left: 50%;\n  height: 16px;\n  width: 100px;\n  margin-top: -8px;\n  margin-left: -50px;\n}\n\n.src-modules-Adapter-_styles_presence_2ZaL0 {\n  left: 20px;\n  height: 14px;\n  width: 14px;\n  border-radius: 8px;\n  margin-top: -7px;\n  display: none;\n  cursor: pointer;\n}\n\n.src-modules-Adapter-_styles_minimized_2g4Fc .src-modules-Adapter-_styles_presence_2ZaL0 {\n  left: 10px;\n}\n\n.src-modules-Adapter-_styles_Offline_1zOmS {\n  display: block;\n  background: #cdcdcd;\n}\n\n.src-modules-Adapter-_styles_Busy_3jl4p {\n  display: block;\n  background: #f95b5c;\n}\n\n.src-modules-Adapter-_styles_Available_zQ2Rl {\n  display: block;\n  background-color: #32ae31;\n}\n\n.src-modules-Adapter-_styles_presenceBar_Vbygh {\n  display: none;\n  position: absolute;\n  width: 8px;\n  height: 2px;\n  border-radius: 1.5px;\n  background-color: #ffffff;\n  -webkit-transform-origin: 50% 50%;\n          transform-origin: 50% 50%;\n  -webkit-transform: translate(3px, 6px);\n          transform: translate(3px, 6px);\n}\n\n.src-modules-Adapter-_styles_DoNotAcceptAnyCalls_3OsQi .src-modules-Adapter-_styles_presenceBar_Vbygh {\n  display: block;\n}\n\n.src-modules-Adapter-_styles_button_2cUDM {\n  box-sizing: border-box;\n  height: 20px;\n  width: 20px;\n  margin-top: -12px;\n  border-radius: 3px;\n  cursor: pointer;\n  border-style: solid;\n  border-width: 1px;\n  border-color: transparent;\n}\n\n.src-modules-Adapter-_styles_button_2cUDM:hover {\n  border-color: #cccccc;\n}\n\n.src-modules-Adapter-_styles_toggle_3YPho {\n  right: 40px;\n}\n\n.src-modules-Adapter-_styles_minimized_2g4Fc .src-modules-Adapter-_styles_toggle_3YPho {\n  right: 3px;\n}\n\n.src-modules-Adapter-_styles_minimizeIcon_38kxv {\n  position: absolute;\n  box-sizing: border-box;\n  left: 3px;\n  bottom: 7px;\n  width: 12px;\n  height: 2px;\n  border: 1px solid #888888;\n}\n\n.src-modules-Adapter-_styles_minimized_2g4Fc .src-modules-Adapter-_styles_minimizeIcon_38kxv {\n  height: 12px;\n  bottom: 3px;\n}\n\n.src-modules-Adapter-_styles_minimizeIconBar_AVpYA {\n  width: 100%;\n  height: 1px;\n  background-color: #888888;\n}\n\n.src-modules-Adapter-_styles_close_16Lea {\n  right: 16px;\n}\n\n.src-modules-Adapter-_styles_minimized_2g4Fc .src-modules-Adapter-_styles_close_16Lea {\n  display: none;\n}\n\n.src-modules-Adapter-_styles_closeIcon_1hANM {\n  position: relative;\n  overflow: hidden;\n  margin: 2px;\n  width: 14px;\n  height: 14px;\n}\n\n.src-modules-Adapter-_styles_closeIcon_1hANM :first-child, .src-modules-Adapter-_styles_closeIcon_1hANM :last-child {\n  position: absolute;\n  height: 2px;\n  width: 100%;\n  top: 6px;\n  left: 0;\n  background: #888888;\n  border-radius: 1px;\n}\n\n.src-modules-Adapter-_styles_closeIcon_1hANM :first-child {\n  -webkit-transform: rotate(45deg);\n          transform: rotate(45deg);\n}\n\n.src-modules-Adapter-_styles_closeIcon_1hANM :last-child {\n  -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n}\n\n.src-modules-Adapter-_styles_contentFrame_3UUGL {\n  display: block;\n  border: none;\n  width: 0;\n  height: 0;\n}\n\n.src-modules-Adapter-_styles_frameContainer_2BV3m {\n  transition: width 0.1s 0s ease-in-out, height 0.1s 0s ease-in-out;\n}\n\n.src-modules-Adapter-_styles_dragOverlay_1DMXF {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 0;\n  height: 0;\n  z-index: 10;\n}\n\n.src-modules-Adapter-_styles_root_319lO.src-modules-Adapter-_styles_dragging_1VCye .src-modules-Adapter-_styles_dragOverlay_1DMXF {\n  width: 500%;\n  height: 500%;\n  left: -200%;\n  top: -200%;\n}\n", ""]);

// exports
exports.locals = {
	"centerStyle": "src-modules-Adapter-_styles_centerStyle_sgBYm",
	"logo": "src-modules-Adapter-_styles_logo_1hTLP",
	"presence": "src-modules-Adapter-_styles_presence_2ZaL0",
	"button": "src-modules-Adapter-_styles_button_2cUDM",
	"root": "src-modules-Adapter-_styles_root_319lO",
	"dragging": "src-modules-Adapter-_styles_dragging_1VCye",
	"closed": "src-modules-Adapter-_styles_closed_1J5E5",
	"loading": "src-modules-Adapter-_styles_loading_hdZTQ",
	"header": "src-modules-Adapter-_styles_header_1a8xP",
	"minimized": "src-modules-Adapter-_styles_minimized_2g4Fc",
	"ringing": "src-modules-Adapter-_styles_ringing_3BzK_",
	"sparkle": "src-modules-Adapter-_styles_sparkle_1cBlF",
	"Offline": "src-modules-Adapter-_styles_Offline_1zOmS",
	"Busy": "src-modules-Adapter-_styles_Busy_3jl4p",
	"Available": "src-modules-Adapter-_styles_Available_zQ2Rl",
	"presenceBar": "src-modules-Adapter-_styles_presenceBar_Vbygh",
	"DoNotAcceptAnyCalls": "src-modules-Adapter-_styles_DoNotAcceptAnyCalls_3OsQi",
	"toggle": "src-modules-Adapter-_styles_toggle_3YPho",
	"minimizeIcon": "src-modules-Adapter-_styles_minimizeIcon_38kxv",
	"minimizeIconBar": "src-modules-Adapter-_styles_minimizeIconBar_AVpYA",
	"close": "src-modules-Adapter-_styles_close_16Lea",
	"closeIcon": "src-modules-Adapter-_styles_closeIcon_1hANM",
	"contentFrame": "src-modules-Adapter-_styles_contentFrame_3UUGL",
	"frameContainer": "src-modules-Adapter-_styles_frameContainer_2BV3m",
	"dragOverlay": "src-modules-Adapter-_styles_dragOverlay_1DMXF"
};

/***/ }),

/***/ 34:
/***/ (function(module, exports) {

var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ }),

/***/ 41:
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ }),

/***/ 42:
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(63)(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});

/***/ }),

/***/ 43:
/***/ (function(module, exports, __webpack_require__) {

var global    = __webpack_require__(41)
  , core      = __webpack_require__(34)
  , ctx       = __webpack_require__(62)
  , hide      = __webpack_require__(64)
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;

/***/ }),

/***/ 48:
/***/ (function(module, exports, __webpack_require__) {

var anObject       = __webpack_require__(58)
  , IE8_DOM_DEFINE = __webpack_require__(160)
  , toPrimitive    = __webpack_require__(130)
  , dP             = Object.defineProperty;

exports.f = __webpack_require__(42) ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};

/***/ }),

/***/ 509:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = __webpack_require__(2);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(3);

var _createClass3 = _interopRequireDefault(_createClass2);

var _classnames = __webpack_require__(12);

var _classnames2 = _interopRequireDefault(_classnames);

var _styles = __webpack_require__(1839);

var _styles2 = _interopRequireDefault(_styles);

var _styles3 = __webpack_require__(336);

var _styles4 = _interopRequireDefault(_styles3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Adapter = function () {
  function Adapter() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        logoUrl = _ref.logoUrl,
        appUrl = _ref.appUrl,
        _ref$prefix = _ref.prefix,
        prefix = _ref$prefix === undefined ? 'rc-integration' : _ref$prefix,
        brand = _ref.brand,
        className = _ref.className,
        _ref$testMode = _ref.testMode,
        testMode = _ref$testMode === undefined ? false : _ref$testMode,
        version = _ref.version;

    (0, _classCallCheck3.default)(this, Adapter);

    this._prefix = prefix;
    this._brand = brand;
    this._appUrl = appUrl;
    this._root = this._initContentDOM(prefix, appUrl);
    this._headerEl = this._root.querySelector('.' + _styles2.default.header);
    this._logoEl = this._root.querySelector('.' + _styles2.default.logo);
    this._contentFrameEl = this._root.querySelector('.' + _styles2.default.contentFrame);
    this._contentFrameContainerEl = this._root.querySelector('.' + _styles2.default.frameContainer);
    this._toggleEl = this._root.querySelector('.' + _styles2.default.toggle);
    this._closeEl = this._root.querySelector('.' + _styles2.default.close);
    this._presenceEl = this._root.querySelector('.' + _styles2.default.presence);

    this._minTranslateX = 0;
    this._translateX = 0;
    this._translateY = 0;
    this._appWidth = 0;
    this._appHeight = 0;
    this._dragStartPosition = null;

    this._closed = true;
    this._minimized = false;
    this._appFocus = false;
    this._dragging = false;
    this._hover = false;
    this._testMode = testMode;

    this._version = version;
    this._loading = true;

    // logo_
    this._logoUrl = logoUrl;
    if (logoUrl) {
      this._logoEl.src = logoUrl;
    }
    this._logoEl.addEventListener('dragstart', function () {
      return false;
    });

    // content
    this._contentFrameEl.setAttribute('class', '' + [_styles2.default.contentFrame, className].join(' '));

    // toggle button
    this._toggleEl.addEventListener('click', function () {
      _this.toggleMinimized();
    });

    // close button
    this._closeEl.addEventListener('click', function () {
      _this.setClosed(true);
    });

    this._presenceEl.addEventListener('click', function () {
      _this.gotoPresence();
    });

    this.syncClass();
    this.setPresence({});
    this.setSize({ width: this._appWidth, height: this._appHeight });
    this.renderRestrictedPosition();

    this._headerEl.addEventListener('mousedown', function (e) {
      _this._dragging = true;
      _this._dragStartPosition = {
        x: e.clientX,
        y: e.clientY,
        translateX: _this._translateX,
        translateY: _this._translateY,
        minTranslateX: _this._minTranslateX
      };
      _this.syncClass();
    });
    this._headerEl.addEventListener('mouseup', function () {
      _this._dragging = false;
      _this.syncClass();
    });
    window.parent.addEventListener('mousemove', function (e) {
      if (_this._dragging) {
        if (e.buttons === 0) {
          _this._dragging = false;
          _this.syncClass();
          return;
        }
        var delta = {
          x: e.clientX - _this._dragStartPosition.x,
          y: e.clientY - _this._dragStartPosition.y
        };
        if (_this._minimized) {
          _this._minTranslateX = _this._dragStartPosition.minTranslateX + delta.x;
        } else {
          _this._translateX = _this._dragStartPosition.translateX + delta.x;
          _this._translateY = _this._dragStartPosition.translateY + delta.y;
        }
        _this.renderRestrictedPosition();
      }
    });

    this._resizeTimeout = null;
    this._resizeTick = null;
    window.parent.addEventListener('resize', function () {
      if (_this._dragging) {
        return;
      }
      if (_this._resizeTimeout) {
        clearTimeout(_this._resizeTimeout);
      }
      _this._resizeTimeout = setTimeout(function () {
        return _this.renderRestrictedPosition();
      }, 100);
      if (!_this._resizeTick || Date.now() - _this._resizeTick > 50) {
        _this._resizeTick = Date.now();
        _this.renderRestrictedPosition();
      }
    });

    window.addEventListener('message', function (e) {
      var data = e.data;
      if (data) {
        switch (data.type) {
          case 'rc-set-closed':
            _this.setClosed(data.closed);
            break;
          case 'rc-set-minimized':
            _this.setMinimized(data.minimized);
            break;
          case 'rc-set-ringing':
            _this.setRinging(data.ringing);
            break;
          case 'rc-set-size':
            _this.setSize(data.size);
            break;
          case 'rc-set-focus':
            _this.setFocus(data.focus);
            break;
          case 'rc-set-presence':
            _this.setPresence(data.presence);
            break;
          case 'rc-call-ring-notify':
            console.log('new ring call:');
            console.log(data.call);
            break;
          case 'rc-call-end-notify':
            console.log('new end call:');
            console.log(data.call);
            break;
          case 'rc-version':
            _this.reportVersion();
            break;
          case 'rc-adapter-init':
            _this.init(data);
            break;
          case 'rc-ribbon-default':
            _this.setClosed(false);
            _this.setMinimized(false);
            break;
          default:
            break;
        }
      }
    });

    this._root.addEventListener('mouseenter', function () {
      _this._hover = true;
      _this.syncClass();
    });
    this._root.addEventListener('mouseleave', function () {
      _this._hover = false;
      _this.syncClass();
    });

    var phoneCallTags = window.document.querySelectorAll('a[href^="tel:"]');
    phoneCallTags.forEach(function (phoneTag) {
      phoneTag.addEventListener('click', function () {
        var hrefStr = phoneTag.getAttribute('href');
        var phoneNumber = hrefStr.replace(/[^\d+*-]/g, '');
        _this.clickToCall(phoneNumber);
      });
    });
    var phoneSMSTags = window.document.querySelectorAll('a[href^="sms:"]');
    phoneSMSTags.forEach(function (phoneTag) {
      phoneTag.addEventListener('click', function () {
        var hrefStr = phoneTag.getAttribute('href');
        var phoneNumber = hrefStr.replace(/[^\d+*-]/g, '');
        _this.clickToSMS(phoneNumber);
      });
    });
  }

  (0, _createClass3.default)(Adapter, [{
    key: '_initContentDOM',
    value: function _initContentDOM(prefix, appUrl) {
      var topDocument = window.document;
      var divEl = topDocument.querySelector('#' + prefix);
      var iframeSrc = appUrl + '?_t=' + Date.now();
      if (divEl) return divEl;
      divEl = this._generateContentDOM(topDocument, prefix, iframeSrc);
      topDocument.body.appendChild(divEl);
      return divEl;
    }

    // eslint-disable-next-line

  }, {
    key: '_generateContentDOM',
    value: function _generateContentDOM(topDocument, prefix, iframeSrc) {
      var divEl = topDocument.createElement('div');
      divEl.id = prefix;
      divEl.setAttribute('class', (0, _classnames2.default)(_styles2.default.root, _styles2.default.loading));
      divEl.draggable = false;

      divEl.innerHTML = '\n      <style>' + _styles4.default.toString() + '</style>\n      <header class="' + _styles2.default.header + '" draggable="false">\n        <div class="' + _styles2.default.presence + '">\n          <div class="' + _styles2.default.presenceBar + '">\n          </div>\n        </div>\n        <div class="' + _styles2.default.button + ' ' + _styles2.default.toggle + '">\n          <div class="' + _styles2.default.minimizeIcon + '">\n            <div class="' + _styles2.default.minimizeIconBar + '"></div>\n          </div>\n        </div>\n        <div class="' + _styles2.default.button + ' ' + _styles2.default.close + '">\n          <div class="' + _styles2.default.closeIcon + '">\n            <div></div><div></div>\n          </div>\n        </div>\n        <img class="' + _styles2.default.logo + '" draggable="false"></img>\n      </header>\n      <div class="' + _styles2.default.frameContainer + '">\n        <iframe id="' + prefix + '-adapter-frame" class="' + _styles2.default.contentFrame + '" src="' + iframeSrc + '">\n        </iframe>\n      </div>\n    ';
      return divEl;
    }
  }, {
    key: '_postMessage',
    value: function _postMessage(data) {
      if (this._contentFrameEl.contentWindow) {
        this._contentFrameEl.contentWindow.postMessage(data, '*');
      }
    }
  }, {
    key: 'renderPosition',
    value: function renderPosition() {
      this._postMessage({
        type: 'rc-adapter-sync-position',
        translateX: this._translateX,
        translateY: this._translateY,
        minTranslateX: this._minTranslateX
      });
      if (this._minimized) {
        this._root.setAttribute('style', 'transform: translate( ' + this._minTranslateX + 'px, 0)!important;');
      } else {
        this._root.setAttribute('style', 'transform: translate(' + this._translateX + 'px, ' + this._translateY + 'px)!important;');
      }
    }
  }, {
    key: 'renderRestrictedPosition',
    value: function renderRestrictedPosition() {
      var style = document.defaultView.getComputedStyle(this._root, null);
      var paddingX = (parseFloat(style.paddingLeft, 10) || 0) + (parseFloat(style.paddingRight, 10) || 0);
      var paddingY = (parseFloat(style.paddingTop, 10) || 0) + (parseFloat(style.paddingBottom, 10) || 0);
      var borderX = (parseFloat(style.borderLeftWidth, 10) || 0) + (parseFloat(style.borderRightWidth, 10) || 0);
      var borderY = (parseFloat(style.borderTopWidth, 10) || 0) + (parseFloat(style.borderBottomWidth, 10) || 0);
      var maximumX = window.parent.innerWidth - (this._minimized ? this._headerEl.clientWidth : this._appWidth) - paddingX - borderX;
      var maximumY = window.parent.innerHeight - (this._minimized ? this._headerEl.clientHeight : this._headerEl.clientHeight + this._appHeight) - paddingY - borderY;

      if (this._minimized) {
        var x = this._minTranslateX;
        x = Math.min(x, maximumX);
        this._minTranslateX = Math.max(x, 0);
      } else {
        var _x2 = this._translateX;
        var y = this._translateY;
        _x2 = Math.min(_x2, maximumX);
        _x2 = Math.max(_x2, 0);
        y = Math.min(y, 0);
        y = Math.max(y, -maximumY);
        this._translateX = _x2;
        this._translateY = y;
      }
      //
      this.renderPosition();
    }
  }, {
    key: 'renderAdapterSize',
    value: function renderAdapterSize() {
      if (this._minimized) {
        this._contentFrameEl.style.width = 0;
        this._contentFrameEl.style.height = 0;
        this._contentFrameContainerEl.style.width = 0;
        this._contentFrameContainerEl.style.height = 0;
      } else {
        this._contentFrameEl.style.width = this._appWidth + 'px';
        this._contentFrameEl.style.height = this._appHeight + 'px';
        this._contentFrameContainerEl.style.width = this._appWidth + 'px';
        this._contentFrameContainerEl.style.height = this._appHeight + 'px';
      }
    }
  }, {
    key: 'syncClass',
    value: function syncClass() {
      //  console.debug('this.sparkled>>>', this.sparkled);
      this._root.setAttribute('class', (0, _classnames2.default)(_styles2.default.root, this._closed && _styles2.default.closed, this._minimized && _styles2.default.minimized, this._appFocus && _styles2.default.focus, this._dragging && _styles2.default.dragging, this._hover && _styles2.default.hover, this._loading && _styles2.default.loading, this._ringing && _styles2.default.ringing));
    }
  }, {
    key: 'setClosed',
    value: function setClosed(closed) {
      this._closed = !!closed;
      this.syncClass();
      this._postMessage({
        type: 'rc-adapter-closed',
        closed: this._closed
      });
    }
  }, {
    key: 'toggleClosed',
    value: function toggleClosed() {
      this.setClosed(!this._closed);
    }
  }, {
    key: 'setMinimized',
    value: function setMinimized(minimized) {
      this._minimized = !!minimized;
      this.syncClass();
      this.renderAdapterSize();
      this.renderRestrictedPosition();
      this._postMessage({
        type: 'rc-adapter-minimized',
        minimized: this._minimized
      });
    }
  }, {
    key: 'toggleMinimized',
    value: function toggleMinimized() {
      this.setMinimized(!this._minimized);
    }
  }, {
    key: 'setRinging',
    value: function setRinging(ringing) {
      this._ringing = !!ringing;
      this.syncClass();
    }
  }, {
    key: 'setFocus',
    value: function setFocus(focus) {
      this._appFocus = !!focus;
      this.syncClass();
      this._postMessage({
        type: 'rc-adapter-focus',
        focus: this._appFocus
      });
    }
  }, {
    key: 'setSize',
    value: function setSize(_ref2) {
      var width = _ref2.width,
          height = _ref2.height;

      this._appWidth = width;
      this._appHeight = height;
      this._contentFrameEl.style.width = width + 'px';
      this._contentFrameEl.style.height = height + 'px';
      this.renderAdapterSize();
      this._postMessage({
        type: 'rc-adapter-size',
        size: {
          width: this._appWidth,
          height: this._appHeight
        }
      });
    }
  }, {
    key: 'setPresence',
    value: function setPresence(presence) {
      if (presence !== this.presence) {
        this.presence = presence;
        this._presenceEl.setAttribute('class', (0, _classnames2.default)(this._minimized && _styles2.default.minimized, _styles2.default.presence, _styles2.default[presence.userStatus], _styles2.default[presence.dndStatus]));
      }
    }
  }, {
    key: 'gotoPresence',
    value: function gotoPresence() {
      this._postMessage({
        type: 'rc-adapter-goto-presence',
        version: this._version
      });
    }
  }, {
    key: 'reportVersion',
    value: function reportVersion() {
      this._postMessage({
        type: 'rc-version-response',
        version: this._version
      });
    }
  }, {
    key: 'setEnvironment',
    value: function setEnvironment() {
      this._postMessage({
        type: 'rc-adapter-set-environment'
      });
    }
  }, {
    key: 'clickToSMS',
    value: function clickToSMS(phoneNumber) {
      this._postMessage({
        type: 'rc-adapter-new-sms',
        phoneNumber: phoneNumber
      });
    }
  }, {
    key: 'clickToCall',
    value: function clickToCall(phoneNumber) {
      var toCall = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this._postMessage({
        type: 'rc-adapter-new-call',
        phoneNumber: phoneNumber,
        toCall: toCall
      });
    }
  }, {
    key: 'init',
    value: function init(_ref3) {
      var size = _ref3.size,
          minimized = _ref3.minimized,
          closed = _ref3.closed,
          _ref3$position = _ref3.position,
          translateX = _ref3$position.translateX,
          translateY = _ref3$position.translateY,
          minTranslateX = _ref3$position.minTranslateX;

      this._postMessage({
        type: 'rc-adapter-mode',
        testMode: this._testMode
      });
      this._minimized = minimized;
      this._closed = closed;
      this._translateX = translateX;
      this._translateY = translateY;
      this._minTranslateX = minTranslateX;
      this._loading = false;
      this.syncClass();
      this.setSize(size);
      this.renderRestrictedPosition();
    }
  }]);
  return Adapter;
}();
// eslint-disable-next-line


exports.default = Adapter;

/***/ }),

/***/ 513:
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSI3NHB4IiBoZWlnaHQ9IjEycHgiIHZpZXdCb3g9IjAgMCA3NCAxMiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNzQgMTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxkZWZzPgoJCQk8cmVjdCBpZD0iU1ZHSURfMV8iIHk9IjAuNTM5IiB3aWR0aD0iNzQiIGhlaWdodD0iMTAuOTIyIi8+CgkJPC9kZWZzPgoJCTxjbGlwUGF0aCBpZD0iU1ZHSURfMl8iPgoJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8xXyIgIG92ZXJmbG93PSJ2aXNpYmxlIi8+CgkJPC9jbGlwUGF0aD4KCQk8cGF0aCBjbGlwLXBhdGg9InVybCgjU1ZHSURfMl8pIiBmaWxsPSIjMDA2MDlDIiBkPSJNMy4zOTEsNi40MDhMMi44Nyw5LjQ1M0gwbDEuNTIzLTguNzQ0aDQuMTI5YzAuNjM1LDAsMS4xNzcsMC4wNDIsMS42MjEsMC4xMTQKCQkJQzcuNzEyLDAuOSw4LjA3MywxLjAyLDguMzUyLDEuMTc4YzAuMjc4LDAuMTU1LDAuNDgsMC4zNTIsMC42MDksMC41OUM5LjA4NSwyLDkuMTQ3LDIuMjc3LDkuMTQ3LDIuNjA0CgkJCWMwLDAuMTcyLTAuMDIxLDAuMzczLTAuMDYyLDAuNkM4Ljk5NywzLjcwNCw4LjgwMSw0LjE0OCw4LjQ5Nyw0LjU0NmMtMC4zLDAuMzkyLTAuNzIzLDAuNjU1LTEuMjU0LDAuNzg5CgkJCWMwLjE3NSwwLjA2NywwLjM0LDAuMTM2LDAuNDgsMC4yMDJDNy44NjIsNS42MDksNy45ODYsNS42OTUsOC4wODksNS44YzAuMDk4LDAuMTA0LDAuMTc2LDAuMjM3LDAuMjMyLDAuMzg4CgkJCWMwLjA1NywwLjE1NCwwLjA4OCwwLjM1NSwwLjA4OCwwLjZjMCwwLjI0Ny0wLjAzMSwwLjU0MS0wLjA4OCwwLjg3MmMtMC4wNTcsMC4zMS0wLjA5OCwwLjU2Mi0wLjEzNCwwLjc2NAoJCQlDOC4xNTYsOC42MjksOC4xNDEsOC43ODQsOC4xNDEsOC44OThjMCwwLjE5NSwwLjA3MiwwLjI5NSwwLjIxNywwLjI5NUw4LjMyMiw5LjQ1Nkg1LjQyQzUuNDA0LDkuMzc5LDUuMzk0LDkuMjc5LDUuMzk0LDkuMTc4CgkJCWMwLTAuMTQsMC4wMS0wLjMxNCwwLjAzMS0wLjUyNUM1LjQ0Niw4LjQzNiw1LjQ4Miw4LjE5Nyw1LjUyOCw3LjkzQzUuNTc0LDcuNjYsNS42LDcuNDM0LDUuNiw3LjI0NwoJCQljMC0wLjMxLTAuMDkzLTAuNTI2LTAuMjg0LTAuNjQ5QzUuMTI1LDYuNDczLDQuNzc0LDYuNDExLDQuMjYzLDYuNDExSDMuMzkxVjYuNDA4eiBNMy43MzIsNC40ODhoMS4xMwoJCQljMC40NDQsMCwwLjc5LTAuMDYyLDEuMDQzLTAuMTgyYzAuMjUzLTAuMTIzLDAuNDAyLTAuMzQxLDAuNDQ5LTAuNjQ2QzYuMzY1LDMuNjIsNi4zNjUsMy41NTcsNi4zNjUsMy40OAoJCQljMC0wLjI1NC0wLjA5My0wLjQzNS0wLjI3OS0wLjU1OUM1LjksMi44MDksNS42NTcsMi43NDYsNS4zNTgsMi43NDZINC4wMjFMMy43MzIsNC40ODh6Ii8+Cgk8L2c+Cgk8Zz4KCQk8ZGVmcz4KCQkJPHJlY3QgaWQ9IlNWR0lEXzNfIiB5PSIwLjUzOSIgd2lkdGg9Ijc0IiBoZWlnaHQ9IjEwLjkyMiIvPgoJCTwvZGVmcz4KCQk8Y2xpcFBhdGggaWQ9IlNWR0lEXzRfIj4KCQkJPHVzZSB4bGluazpocmVmPSIjU1ZHSURfM18iICBvdmVyZmxvdz0idmlzaWJsZSIvPgoJCTwvY2xpcFBhdGg+CgkJPHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzRfKSIgZmlsbD0iIzAwNjA5QyIgZD0iTTEzLjE3MywzLjA4OWgyLjMwMkwxNS4zMSw0LjA4NWMwLjM1MS0wLjM4NywwLjcxMi0wLjY4MSwxLjA4NC0wLjg3NwoJCQljMC4zNjEtMC4yMDEsMC43ODUtMC4zLDEuMjctMC4zYzAuNzEyLDAsMS4yMzksMC4xNjUsMS41NjksMC40OTZjMC4zMzEsMC4zMzUsMC40OTYsMC44MTQsMC40OTYsMS40NDkKCQkJYzAsMC4yNDgtMC4wMjEsMC41MTItMC4wNzIsMC43ODVsLTAuNjUsMy44MTNoLTIuNTI5bDAuNTc4LTMuMzY1YzAuMDMxLTAuMTQ2LDAuMDQyLTAuMjg0LDAuMDQyLTAuNDIzCgkJCWMwLTAuMjE3LTAuMDUyLTAuNDAzLTAuMTU1LTAuNTQ4Yy0wLjEwMy0wLjE0Ni0wLjI4OS0wLjIxOC0wLjU2Ny0wLjIxOGMtMC4zODIsMC0wLjY3MSwwLjExNS0wLjg0NywwLjM0OAoJCQljLTAuMTc2LDAuMjMtMC4yOTksMC41NTItMC4zNjEsMC45NjVMMTQuNjEsOS40NTJoLTIuNTI5TDEzLjE3MywzLjA4OXoiLz4KCTwvZz4KCTxnPgoJCTxkZWZzPgoJCQk8cmVjdCBpZD0iU1ZHSURfNV8iIHk9IjAuNTM5IiB3aWR0aD0iNzQiIGhlaWdodD0iMTAuOTIyIi8+CgkJPC9kZWZzPgoJCTxjbGlwUGF0aCBpZD0iU1ZHSURfNl8iPgoJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF81XyIgIG92ZXJmbG93PSJ2aXNpYmxlIi8+CgkJPC9jbGlwUGF0aD4KCQk8cGF0aCBjbGlwLXBhdGg9InVybCgjU1ZHSURfNl8pIiBmaWxsPSIjMDA2MDlDIiBkPSJNMjIuMDkzLDkuNjI5djAuMDM2YzAsMC4wODgsMC4wNDEsMC4xNywwLjExMywwLjI0MgoJCQljMC4wODMsMC4xMDQsMC4yNTgsMC4xNTUsMC41MTYsMC4xNTVjMC4zNzIsMCwwLjY0LTAuMDk0LDAuODI2LTAuMjc5czAuMzItMC41MDYsMC40MDItMC45NmwwLjEwNC0wLjUyMQoJCQljLTAuMjE3LDAuMTg4LTAuNDc1LDAuMzUzLTAuNzg1LDAuNDg1Yy0wLjMyLDAuMTQtMC43MDIsMC4yMDctMS4xNjcsMC4yMDdjLTAuMzgyLDAtMC43MTItMC4wNjItMS4wMDEtMC4xODIKCQkJcy0wLjUyNi0wLjI4OS0wLjcyMy0wLjQ5NmMtMC4xOTYtMC4yMTEtMC4zNDEtMC40NjMtMC40MzQtMC43NTJjLTAuMTAzLTAuMjk1LTAuMTQ1LTAuNjA0LTAuMTQ1LTAuOTM5CgkJCWMwLTAuMTA0LDAtMC4yMDcsMC4wMjEtMC4zMTFjMC4wMS0wLjEwNywwLjAyMS0wLjIxNywwLjA0Mi0wLjMzYzAuMDYyLTAuMzg3LDAuMTc1LTAuNzc5LDAuMzQxLTEuMTY2CgkJCWMwLjE2NS0wLjM4OSwwLjM5Mi0wLjczMywwLjY3MS0xLjAzOWMwLjI3OS0wLjMwMywwLjYwOS0wLjU1MSwxLjAxMi0wLjc0MmMwLjM5Mi0wLjE4NiwwLjg0Ny0wLjI4MywxLjM3My0wLjI4MwoJCQljMC4zOTIsMCwwLjczMywwLjA5NCwxLjA0MiwwLjI3OGMwLjI5OSwwLjE4MSwwLjUzNywwLjQyOSwwLjcyMywwLjczM2wwLjEzNC0wLjgzMmgyLjIyTDI2LjQ5LDguMDU5CgkJCWMtMC4wODMsMC40NzYtMC4xODYsMC45MjQtMC4zMTEsMS4zMzhjLTAuMTIzLDAuNDEyLTAuMzMsMC43NzMtMC41OTksMS4wNzhjLTAuMjc5LDAuMzExLTAuNjUsMC41NTMtMS4xMzYsMC43MjQKCQkJYy0wLjQ3NSwwLjE3NS0xLjEwNCwwLjI2My0xLjg4OSwwLjI2M2MtMC41NTgsMC0xLjAyMi0wLjA0Ni0xLjM5NC0wLjE0NWMtMC4zODItMC4wOTktMC42OTItMC4yMjgtMC45MjktMC4zODcKCQkJYy0wLjIzNy0wLjE2Ni0wLjQwMy0wLjM1My0wLjUxNi0wLjU2MmMtMC4xMDQtMC4yMDctMC4xNjUtMC40My0wLjE2NS0wLjY1NlY5LjYyOUgyMi4wOTN6IE0yMy42LDQuNTUKCQkJYy0wLjE4NiwwLTAuMzUxLDAuMDM2LTAuNDg1LDAuMTEzYy0wLjEzNCwwLjA3MS0wLjI1OCwwLjE3MS0wLjM1MSwwLjMwNWMtMC4xMDMsMC4xMy0wLjE3NSwwLjI4NC0wLjIzNywwLjQ2CgkJCUMyMi40NjUsNS42MDksMjIuNDEzLDUuNzk5LDIyLjM4Miw2Yy0wLjAxLDAuMDYyLTAuMDEsMC4xMTQtMC4wMSwwLjE2Yy0wLjAxMSwwLjA1Mi0wLjAxMSwwLjA5OS0wLjAxMSwwLjE0NQoJCQljMCwwLjI1NCwwLjA2MiwwLjQ3NSwwLjE4NiwwLjY1NWMwLjEyNCwwLjE4NywwLjMzMSwwLjI3OSwwLjYyLDAuMjg5aDAuMDUxYzAuMTg2LDAsMC4zNDEtMC4wNDEsMC40ODUtMC4xMTMKCQkJYzAuMTQ0LTAuMDcxLDAuMjU4LTAuMTcxLDAuMzYxLTAuMjg4YzAuMTAzLTAuMTI1LDAuMTg2LTAuMjY0LDAuMjQ4LTAuNDI0YzAuMDcyLTAuMTYsMC4xMTQtMC4zMiwwLjE1NS0wLjQ5NgoJCQljMC4wMjEtMC4xMjksMC4wMzEtMC4yNjMsMC4wMzEtMC40MDJjMC0wLjI2OS0wLjA2Mi0wLjQ5NC0wLjE5Ni0wLjY4N2MtMC4xMjQtMC4xOS0wLjM1MS0wLjI4OS0wLjY4MS0wLjI4OUgyMy42eiIvPgoJPC9nPgoJPGc+CgkJPGRlZnM+CgkJCTxyZWN0IGlkPSJTVkdJRF83XyIgeT0iMC41MzkiIHdpZHRoPSI3NCIgaGVpZ2h0PSIxMC45MjIiLz4KCQk8L2RlZnM+CgkJPGNsaXBQYXRoIGlkPSJTVkdJRF84XyI+CgkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzdfIiAgb3ZlcmZsb3c9InZpc2libGUiLz4KCQk8L2NsaXBQYXRoPgoJCTxwYXRoIGNsaXAtcGF0aD0idXJsKCNTVkdJRF84XykiIGZpbGw9IiNGMzhCMDAiIGQ9Ik0zMy4yOTQsNC4xMjdjMC0wLjAzMSwwLjAxMS0wLjA1OSwwLjAxMS0wLjA4M2MwLTAuMDIxLDAuMDEtMC4wNDcsMC4wMS0wLjA3NwoJCQljMC0wLjM4OC0wLjExNC0wLjY4Mi0wLjMzMi0wLjg4M2MtMC4yMTctMC4yMDctMC41MjUtMC4zMTEtMC45MjgtMC4zMTFjLTAuNDc2LDAtMC44ODksMC4xOTctMS4yMjksMC42CgkJCWMtMC4zMzEsMC40MDItMC41NjgsMS4wMDctMC43MTIsMS44MTJjLTAuMDMxLDAuMTQ4LTAuMDUzLDAuMjk5LTAuMDYyLDAuNDM4Yy0wLjAyMSwwLjE0NS0wLjAyMSwwLjI3OS0wLjAyMSwwLjQwOAoJCQljMCwwLjIwMSwwLjAxMSwwLjM4NywwLjA2MiwwLjU1M2MwLjA0MiwwLjE3LDAuMTE0LDAuMzE0LDAuMjE3LDAuNDQzYzAuMTA0LDAuMTIzLDAuMjM4LDAuMjIyLDAuNDAzLDAuMjk5CgkJCWMwLjE3NSwwLjA3MiwwLjM4MiwwLjEwNywwLjY0LDAuMTA3YzAuNDQ0LDAsMC43OTUtMC4xMzQsMS4wNTMtMC40MDFjMC4yNy0wLjI2OSwwLjQ2Ni0wLjU5OSwwLjU3OC0xLjAwMWgyLjYxMwoJCQljLTAuMTU0LDAuNTM3LTAuMzcxLDEuMDE3LTAuNjYsMS40MzVjLTAuMjg5LDAuNDI1LTAuNjMxLDAuNzg1LTEuMDIyLDEuMDc5cy0wLjgzNiwwLjUxNi0xLjMyMSwwLjY3NgoJCQljLTAuNDg0LDAuMTU1LTEuMDAxLDAuMjMyLTEuNTQ4LDAuMjMyYy0wLjU4OSwwLTEuMTI1LTAuMDcyLTEuNTgtMC4yMjdjLTAuNDY1LTAuMTU2LTAuODQ3LTAuMzc3LTEuMTY3LTAuNjY2CgkJCWMtMC4zMi0wLjI5NS0wLjU1OS0wLjY0Ni0wLjcyMy0xLjA2M2MtMC4xNjYtMC40MTgtMC4yNDgtMC44ODgtMC4yNDgtMS40MTljMC0wLjE1LDAuMDEtMC4zMTEsMC4wMjEtMC40NzcKCQkJYzAuMDIxLTAuMTY0LDAuMDQxLTAuMzM0LDAuMDcxLTAuNTExYzAuMTE0LTAuNjY2LDAuMzE5LTEuMjY1LDAuNjMtMS44MDdjMC4zMTEtMC41MzEsMC42ODItMC45OTEsMS4xMTUtMS4zNjIKCQkJYzAuNDM0LTAuMzc3LDAuOTI5LTAuNjY2LDEuNDY2LTAuODY3czEuMDk1LTAuMzA1LDEuNjcyLTAuMzA1YzEuMTk4LDAsMi4wOTcsMC4yNjQsMi42OTQsMC43OTUKCQkJYzAuNTg5LDAuNTI1LDAuODg4LDEuMjcsMC44ODgsMi4yMzR2MC4xNzZjMCwwLjA1Mi0wLjAxLDAuMTA3LTAuMDEsMC4xNzFMMzMuMjk0LDQuMTI3TDMzLjI5NCw0LjEyN3oiLz4KCTwvZz4KCTxnPgoJCTxkZWZzPgoJCQk8cmVjdCBpZD0iU1ZHSURfOV8iIHk9IjAuNTM5IiB3aWR0aD0iNzQiIGhlaWdodD0iMTAuOTIyIi8+CgkJPC9kZWZzPgoJCTxjbGlwUGF0aCBpZD0iU1ZHSURfMTBfIj4KCQkJPHVzZSB4bGluazpocmVmPSIjU1ZHSURfOV8iICBvdmVyZmxvdz0idmlzaWJsZSIvPgoJCTwvY2xpcFBhdGg+CgkJPHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzEwXykiIGZpbGw9IiNGMzhCMDAiIGQ9Ik0zOC41MTgsNi42NjFjLTAuMDExLDAuMDQxLTAuMDIxLDAuMDgyLTAuMDIxLDAuMTE4CgkJCWMtMC4wMTEsMC4wNDEtMC4wMTEsMC4wODItMC4wMTEsMC4xMjNjMCwwLjMxMSwwLjEwNCwwLjU1NCwwLjMxLDAuNzM4YzAuMTk2LDAuMTgyLDAuNDU1LDAuMjcsMC43NTQsMC4yNwoJCQljMC4xOTYsMCwwLjM5NC0wLjA0NywwLjU3OC0wLjE0MWMwLjE4NS0wLjA5MywwLjM0MS0wLjIzMSwwLjQ2NS0wLjQxOGgyLjQxNmMtMC4xNzYsMC4zOTctMC40MTMsMC43MjktMC43MDIsMC45OTYKCQkJYy0wLjI4OSwwLjI2OS0wLjU5OSwwLjQ4NS0wLjk0OSwwLjY1Yy0wLjM1MiwwLjE2NS0wLjcxMywwLjI4NC0xLjEwNCwwLjM1MmMtMC4zODIsMC4wNzEtMC43NTQsMC4xMDQtMS4xMjUsMC4xMDQKCQkJYy0wLjQ1NCwwLTAuODc4LTAuMDU3LTEuMjYtMC4xN2MtMC4zODItMC4xMTQtMC43MDItMC4yODQtMC45NzktMC41MTJjLTAuMjc5LTAuMjIzLTAuNDg2LTAuNS0wLjY0Mi0wLjgzMgoJCQljLTAuMTU0LTAuMzI0LTAuMjM3LTAuNy0wLjIzNy0xLjEzNWMwLTAuMTA0LDAuMDEyLTAuMjEyLDAuMDIxLTAuMzJjMC4wMTEtMC4xMDcsMC4wMzEtMC4yMjEsMC4wNDItMC4zMzQKCQkJYzAuMDkzLTAuNTE4LDAuMjY4LTAuOTkxLDAuNTI2LTEuNDE2YzAuMjU4LTAuNDIyLDAuNTc3LTAuNzgzLDAuOTQ4LTEuMDc3YzAuMzgyLTAuMywwLjc5NS0wLjUyNywxLjI2MS0wLjY4NwoJCQljMC40NzUtMC4xNjYsMC45NTktMC4yNDQsMS40NjUtMC4yNDRjMC41MTgsMCwwLjk2MSwwLjA3MiwxLjM1NCwwLjIxN2MwLjM5MywwLjE0NiwwLjczMiwwLjM0NywwLjk5MSwwLjYwOQoJCQljMC4yNjksMC4yNTgsMC40NzUsMC41NzMsMC42MDgsMC45NDRjMC4xMzUsMC4zNzIsMC4yMDcsMC43ODUsMC4yMDcsMS4yMjljMCwwLjI3Mi0wLjAzMSwwLjU4OC0wLjA5NCwwLjkzNUgzOC41MTh6CgkJCSBNNDEuMDI1LDUuMzc2YzAuMDExLTAuMDQyLDAuMDExLTAuMTA0LDAuMDExLTAuMTg3YzAtMC4yNTgtMC4wODItMC40NzYtMC4yNjktMC42NTVjLTAuMTc2LTAuMTc3LTAuMzkzLTAuMjYzLTAuNjYtMC4yNjMKCQkJYy0wLjM4MywwLTAuNjkxLDAuMDk4LTAuOTMsMC4yOTNjLTAuMjI4LDAuMjAxLTAuMzgzLDAuNDcxLTAuNDQzLDAuODEySDQxLjAyNXoiLz4KCTwvZz4KCTxnPgoJCTxkZWZzPgoJCQk8cmVjdCBpZD0iU1ZHSURfMTFfIiB5PSIwLjUzOSIgd2lkdGg9Ijc0IiBoZWlnaHQ9IjEwLjkyMiIvPgoJCTwvZGVmcz4KCQk8Y2xpcFBhdGggaWQ9IlNWR0lEXzEyXyI+CgkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzExXyIgIG92ZXJmbG93PSJ2aXNpYmxlIi8+CgkJPC9jbGlwUGF0aD4KCQk8cGF0aCBjbGlwLXBhdGg9InVybCgjU1ZHSURfMTJfKSIgZmlsbD0iI0YzOEIwMCIgZD0iTTQ0LjI1OCwzLjA4OWgyLjMwM2wtMC4xNzcsMC45OTZjMC4zNjEtMC4zODcsMC43MjQtMC42ODEsMS4wODQtMC44NzcKCQkJYzAuMzcyLTAuMjAxLDAuNzk2LTAuMywxLjI4LTAuM2MwLjcxMywwLDEuMjI5LDAuMTY1LDEuNTY4LDAuNDk2YzAuMzMsMC4zMzUsMC40OTYsMC44MTQsMC40OTYsMS40NDkKCQkJYzAsMC4yNDgtMC4wMywwLjUxMi0wLjA3MSwwLjc4NUw1MC4wOCw5LjQ1MmgtMi41MjlsMC41OS0zLjM2NWMwLjAyMS0wLjE0NiwwLjAyOS0wLjI4NCwwLjAyOS0wLjQyMwoJCQljMC0wLjIxNy0wLjA0MS0wLjQwMy0wLjE0NS0wLjU0OGMtMC4xMDQtMC4xNDYtMC4yODktMC4yMTgtMC41NjctMC4yMThjLTAuMzgyLDAtMC42NzEsMC4xMTUtMC44NDcsMC4zNDgKCQkJYy0wLjE4NywwLjIzLTAuMzAxLDAuNTUyLTAuMzczLDAuOTY1bC0wLjU1NywzLjI0MWgtMi41Mkw0NC4yNTgsMy4wODl6Ii8+Cgk8L2c+Cgk8Zz4KCQk8ZGVmcz4KCQkJPHJlY3QgaWQ9IlNWR0lEXzEzXyIgeT0iMC41MzkiIHdpZHRoPSI3NCIgaGVpZ2h0PSIxMC45MjIiLz4KCQk8L2RlZnM+CgkJPGNsaXBQYXRoIGlkPSJTVkdJRF8xNF8iPgoJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8xM18iICBvdmVyZmxvdz0idmlzaWJsZSIvPgoJCTwvY2xpcFBhdGg+CgkJPHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzE0XykiIGZpbGw9IiNGMzhCMDAiIGQ9Ik01NC43NTcsOS40MDdjLTAuMjg5LDAuMDE1LTAuNTQ3LDAuMDI0LTAuNzg0LDAuMDM2CgkJCWMtMC4yMzgsMC4wMS0wLjQ2NSwwLjAxLTAuNjYsMC4wMWMtMC4zODMsMC0wLjcwMy0wLjAxNi0wLjk2MS0wLjA1M2MtMC4yNTktMC4wMzUtMC40NjUtMC4xMDMtMC42MTktMC4xOTUKCQkJYy0wLjE1NC0wLjA5NC0wLjI2OS0wLjIxNy0wLjMzLTAuMzcxYy0wLjA2Mi0wLjE0OC0wLjA5NC0wLjM0Ni0wLjA5NC0wLjU4M2MwLTAuMTQ2LDAuMDEyLTAuMzA2LDAuMDIxLTAuNDkxCgkJCWMwLjAyMS0wLjE4MSwwLjA1Mi0wLjM4MiwwLjA5My0wLjU5OWwwLjQ2Ni0yLjY2M0g1MC45OWwwLjIzNi0xLjQ1NWgwLjkzOWwwLjM1Mi0xLjk4MmgyLjQ4OGwtMC4zNTIsMS45ODJoMS4yMTlsLTAuMjQ4LDEuNDU1CgkJCWgtMS4yMDhsLTAuNDAxLDIuMzE2Yy0wLjAyMSwwLjA3OC0wLjAzMSwwLjE0MS0wLjA0MywwLjIwMWMtMC4wMSwwLjA2Mi0wLjAxLDAuMTE5LTAuMDEsMC4xNjZjMCwwLjE1NCwwLjA1MywwLjI2NCwwLjE0NSwwLjMzCgkJCWMwLjEwNCwwLjA2MiwwLjI3OCwwLjA5OCwwLjU0NywwLjA5OGgwLjQwMkw1NC43NTcsOS40MDd6Ii8+Cgk8L2c+Cgk8Zz4KCQk8ZGVmcz4KCQkJPHJlY3QgaWQ9IlNWR0lEXzE1XyIgeT0iMC41MzkiIHdpZHRoPSI3NCIgaGVpZ2h0PSIxMC45MjIiLz4KCQk8L2RlZnM+CgkJPGNsaXBQYXRoIGlkPSJTVkdJRF8xNl8iPgoJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8xNV8iICBvdmVyZmxvdz0idmlzaWJsZSIvPgoJCTwvY2xpcFBhdGg+CgkJPHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzE2XykiIGZpbGw9IiNGMzhCMDAiIGQ9Ik01Ni4zODksMy4wODloMi4zMDNMNTguNDYzLDQuMzhoMC4wMzFDNTksMy4zOTgsNTkuNzMyLDIuOTA4LDYwLjcwMywyLjkwOAoJCQljMC4wNTIsMCwwLjExMywwLjAwNSwwLjE2NSwwLjAxMWMwLjA1MiwwLjAxMSwwLjEwNCwwLjAyMSwwLjE2NSwwLjAyNGwtMC40NTQsMi41MjljLTAuMDgyLTAuMDIxLTAuMTY1LTAuMDM1LTAuMjQ4LTAuMDUyCgkJCWMtMC4wODItMC4wMTctMC4xNzUtMC4wMjQtMC4yNTgtMC4wMjRjLTAuNTE3LDAtMC45MjksMC4xNC0xLjIzOCwwLjQxMmMtMC4zLDAuMjc4LTAuNTE3LDAuNzYtMC42MywxLjQ0NGwtMC4zODIsMi4xOTloLTIuNTI5CgkJCUw1Ni4zODksMy4wODl6Ii8+Cgk8L2c+Cgk8Zz4KCQk8ZGVmcz4KCQkJPHJlY3QgaWQ9IlNWR0lEXzE3XyIgeT0iMC41MzkiIHdpZHRoPSI3NCIgaGVpZ2h0PSIxMC45MjIiLz4KCQk8L2RlZnM+CgkJPGNsaXBQYXRoIGlkPSJTVkdJRF8xOF8iPgoJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8xN18iICBvdmVyZmxvdz0idmlzaWJsZSIvPgoJCTwvY2xpcFBhdGg+CgkJPHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzE4XykiIGZpbGw9IiNGMzhCMDAiIGQ9Ik02NC40MDksOS40NjlsLTAuMDExLTAuODc4Yy0wLjQxMiwwLjM0MS0wLjgyNSwwLjU2OC0xLjIxOSwwLjY4NwoJCQljLTAuNDAyLDAuMTE5LTAuODQ3LDAuMTc3LTEuMzIsMC4xNzdjLTAuMjcsMC0wLjUyNi0wLjAzMS0wLjc2NC0wLjA4OGMtMC4yNDgtMC4wNjItMC40NTUtMC4xNTQtMC42MzEtMC4yODkKCQkJYy0wLjE4Ni0wLjEyOS0wLjMyLTAuMjg5LTAuNDM0LTAuNDc5Yy0wLjEwNC0wLjE4Ny0wLjE1NS0wLjQxOC0wLjE1NS0wLjY4N2MwLTAuMTE0LDAuMDExLTAuMjM3LDAuMDQyLTAuMzc3CgkJCWMwLjA3Mi0wLjQ3NiwwLjI1OC0wLjg1MywwLjUyNS0xLjEyYzAuMjctMC4yNzMsMC41ODktMC40NzUsMC45NDktMC42MTRjMC4zNTMtMC4xNCwwLjczMy0wLjIzMSwxLjEzNy0wLjI4NAoJCQljMC40MDItMC4wNTcsMC43NzMtMC4xMDMsMS4xMTUtMC4xNDhjMC4zNTEtMC4wNDEsMC42NC0wLjEwNCwwLjg3Ny0wLjE4MmMwLjIzNy0wLjA3NiwwLjM3MS0wLjIxNywwLjQxMi0wLjQxOAoJCQljMC0wLjAxNiwwLTAuMDMxLDAtMC4wNDFjMC0wLjAxNiwwLjAxMi0wLjAyNSwwLjAxMi0wLjA0MWMwLTAuMDk5LTAuMDMxLTAuMTc2LTAuMDk0LTAuMjMxYy0wLjA1Mi0wLjA1OC0wLjEyMy0wLjEwNC0wLjE5NS0wLjEzCgkJCXMtMC4xNTUtMC4wNDctMC4yNDgtMC4wNjJjLTAuMDk0LTAuMDExLTAuMTY1LTAuMDE2LTAuMjE3LTAuMDE2Yy0wLjA5NCwwLTAuMTg3LDAuMDA1LTAuMjg5LDAuMDE2CgkJCWMtMC4xMDQsMC4wMTYtMC4xOTYsMC4wNDEtMC4yNzgsMC4wODhjLTAuMDkzLDAuMDQ3LTAuMTc2LDAuMTA4LTAuMjU5LDAuMTg3Yy0wLjA3MiwwLjA4My0wLjEyMywwLjE5LTAuMTY1LDAuMzNoLTIuNDI3CgkJCWMwLjA2Mi0wLjM0MSwwLjE3Ny0wLjY0NiwwLjM0Mi0wLjkwM2MwLjE3Ni0wLjI2MywwLjQxMi0wLjQ5LDAuNzIzLTAuNjcxczAuNjkxLTAuMzE5LDEuMTQ2LTAuNDE4CgkJCWMwLjQ1My0wLjA5OSwxLjAwMi0wLjE0NiwxLjYzMi0wLjE0NmMwLjU3NywwLDEuMDQyLDAuMDM3LDEuNDEzLDAuMTEzYzAuMzcxLDAuMDc4LDAuNjYsMC4xOTEsMC44NjcsMC4zMzYKCQkJYzAuMjE3LDAuMTQ2LDAuMzYxLDAuMzIsMC40NDMsMC41MjFjMC4wNzIsMC4yMDEsMC4xMTQsMC40MjksMC4xMTQsMC42ODJjMCwwLjE0OC0wLjAxMSwwLjMxMS0wLjAzMSwwLjQ3MQoJCQljLTAuMDIxLDAuMTY0LTAuMDQxLDAuMzM0LTAuMDcxLDAuNTFMNjYuODM0LDguMzRjLTAuMDIxLDAuMTM1LTAuMDI5LDAuMjQ4LTAuMDI5LDAuMzQyYzAsMC4wODgsMC4wMSwwLjE2NCwwLjA0MSwwLjIzMQoJCQljMC4wNDEsMC4wNzEsMC4wOTIsMC4xNDksMC4xODYsMC4yMzdsLTAuMDEsMC4zMmgtMi42MTJWOS40Njl6IE02My4yNDMsOC4wMmMwLjIxNywwLDAuNDExLTAuMDM3LDAuNTc3LTAuMTE5CgkJCWMwLjE2Ni0wLjA3NywwLjMxMS0wLjE5LDAuNDI0LTAuMzM2YzAuMTEzLTAuMTQsMC4xOTUtMC4zMDUsMC4yNTgtMC40OTZjMC4wNzItMC4xODksMC4xMTQtMC4zOTYsMC4xMzUtMC42MTMKCQkJYy0wLjIyOCwwLjEtMC40NTMsMC4xNzEtMC42ODIsMC4yMTJjLTAuMjI5LDAuMDQ3LTAuNDQzLDAuMDkzLTAuNjUsMC4xNDljLTAuMTk1LDAuMDUyLTAuMzYxLDAuMTIzLTAuNTA2LDAuMjIyCgkJCXMtMC4yMjksMC4yNDgtMC4yNTgsMC40NDh2MC4wNzJjMCwwLjE0MSwwLjA1MiwwLjI1NCwwLjE3NSwwLjMzNkM2Mi44Myw3Ljk3Nyw2My4wMDUsOC4wMiw2My4yNDMsOC4wMiIvPgoJPC9nPgoJPGc+CgkJPGRlZnM+CgkJCTxyZWN0IGlkPSJTVkdJRF8xOV8iIHk9IjAuNTM5IiB3aWR0aD0iNzQiIGhlaWdodD0iMTAuOTIyIi8+CgkJPC9kZWZzPgoJCTxjbGlwUGF0aCBpZD0iU1ZHSURfMjBfIj4KCQkJPHVzZSB4bGluazpocmVmPSIjU1ZHSURfMTlfIiAgb3ZlcmZsb3c9InZpc2libGUiLz4KCQk8L2NsaXBQYXRoPgoJCTxwb2x5Z29uIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yMF8pIiBmaWxsPSIjRjM4QjAwIiBwb2ludHM9IjY3LjQ1NSw5LjQ1MyA2OC45NzMsMC43MDkgNzEuNTAyLDAuNzA5IDY5Ljk4NCw5LjQ1MyAJCSIvPgoJPC9nPgoJPGc+CgkJPGRlZnM+CgkJCTxyZWN0IGlkPSJTVkdJRF8yMV8iIHk9IjAuNTM5IiB3aWR0aD0iNzQiIGhlaWdodD0iMTAuOTIyIi8+CgkJPC9kZWZzPgoJCTxjbGlwUGF0aCBpZD0iU1ZHSURfMjJfIj4KCQkJPHVzZSB4bGluazpocmVmPSIjU1ZHSURfMjFfIiAgb3ZlcmZsb3c9InZpc2libGUiLz4KCQk8L2NsaXBQYXRoPgoJCTxwb2x5Z29uIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yMl8pIiBmaWxsPSIjMDA2MDlDIiBwb2ludHM9IjguNzk2LDkuNDUzIDEwLjIxNSw0LjI4NiAxMi4wNDgsNC4yODYgMTEuMzA0LDkuNDUzIAkJIi8+Cgk8L2c+Cgk8Zz4KCQk8ZGVmcz4KCQkJPHJlY3QgaWQ9IlNWR0lEXzIzXyIgeT0iMC41MzkiIHdpZHRoPSI3NCIgaGVpZ2h0PSIxMC45MjIiLz4KCQk8L2RlZnM+CgkJPGNsaXBQYXRoIGlkPSJTVkdJRF8yNF8iPgoJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8yM18iICBvdmVyZmxvdz0idmlzaWJsZSIvPgoJCTwvY2xpcFBhdGg+CgkJPHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzI0XykiIGZpbGw9IiNGMzhCMDAiIGQ9Ik0xMi45NjYsMS45ODR2LTAuMDFjLTAuMDEtMC4wMTEtMC4wMjEtMC4wMzEtMC4wNDEtMC4wNTIKCQkJYy0wLjAzMS0wLjA1Mi0wLjA5My0wLjExOC0wLjE4Ni0wLjIwMmMtMC4xNzUtMC4xNDgtMC40NTQtMC4zMy0wLjkyOS0wLjQxOGMtMC4yMjctMC4wNDEtMC40MjMtMC4wNDEtMC41ODgtMC4wMjUKCQkJYy0wLjQxMywwLjA0Ny0wLjY2MSwwLjIwNy0wLjc0OSwwLjI3OWMtMC4wMjUsMC4wMjEtMC4wMzEsMC4wMjUtMC4wMzEsMC4wMjVsMCwwYy0wLjExNCwwLjExMy0wLjMwNSwwLjExMy0wLjQyMywwCgkJCWMtMC4xMTMtMC4xMTktMC4xMTMtMC4zMDUsMC0wLjQyNGMwLjAzMS0wLjAzLDAuNDEzLTAuMzk3LDEuMTQxLTAuNDc1YzAuMjI4LTAuMDIxLDAuNDc1LTAuMDE3LDAuNzY0LDAuMDM1CgkJCWMxLjE1NiwwLjIwMSwxLjU1OSwwLjk0NCwxLjU4LDAuOTk2YzAuMDcyLDAuMTQ1LDAuMDEsMC4zMjUtMC4xMzQsMC40MDJjLTAuMDMxLDAuMDE2LTAuMDcyLDAuMDI1LTAuMTAzLDAuMDI1CgkJCUMxMy4xNDIsMi4xNiwxMy4wMjgsMi4wOTgsMTIuOTY2LDEuOTg0Ii8+Cgk8L2c+Cgk8Zz4KCQk8ZGVmcz4KCQkJPHJlY3QgaWQ9IlNWR0lEXzI1XyIgeT0iMC41MzkiIHdpZHRoPSI3NCIgaGVpZ2h0PSIxMC45MjIiLz4KCQk8L2RlZnM+CgkJPGNsaXBQYXRoIGlkPSJTVkdJRF8yNl8iPgoJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8yNV8iICBvdmVyZmxvdz0idmlzaWJsZSIvPgoJCTwvY2xpcFBhdGg+CgkJPHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzI2XykiIGZpbGw9IiNGMzhCMDAiIGQ9Ik0xMi4yMjMsMi42NjZjMCwwLDAtMC4wMDYtMC4wMS0wLjAzMWMtMC4wMjEtMC4wMjEtMC4wNTItMC4wNjItMC4xMDMtMC4xMDQKCQkJYy0wLjA5My0wLjA4Mi0wLjI1OC0wLjE4Ni0wLjUxNy0wLjIzMmMtMC4xMzQtMC4wMjUtMC4yNDgtMC4wMjUtMC4zNC0wLjAxNWMtMC4yMTcsMC4wMjQtMC4zNjEsMC4xMTItMC40MDMsMC4xNDkKCQkJYy0wLjAxLDAuMDEtMC4wMSwwLjAxLTAuMDEsMC4wMWMtMC4wOTMsMC4wOTktMC4yNTgsMC4wOTktMC4zNTEsMGMtMC4wOTgtMC4wOTgtMC4wOTgtMC4yNTQsMC0wLjM1MgoJCQljMC4wMjEtMC4wMjUsMC4yNTgtMC4yNTgsMC43MjMtMC4zMDVjMC4xMzQtMC4wMTYsMC4yODktMC4wMSwwLjQ2NSwwLjAyMWMwLjcyMywwLjEyOSwwLjk4LDAuNTg4LDAuOTkxLDAuNjI5CgkJCWMwLjA2MiwwLjEyNSwwLjAyMSwwLjI3My0wLjEwMywwLjMzNmMtMC4wMzEsMC4wMTEtMC4wNjIsMC4wMjEtMC4wOTMsMC4wMjVDMTIuMzc4LDIuODExLDEyLjI3NSwyLjc1OSwxMi4yMjMsMi42NjYiLz4KCTwvZz4KCTxnPgoJCTxkZWZzPgoJCQk8cmVjdCBpZD0iU1ZHSURfMjdfIiB5PSIwLjUzOSIgd2lkdGg9Ijc0IiBoZWlnaHQ9IjEwLjkyMiIvPgoJCTwvZGVmcz4KCQk8Y2xpcFBhdGggaWQ9IlNWR0lEXzI4XyI+CgkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzI3XyIgIG92ZXJmbG93PSJ2aXNpYmxlIi8+CgkJPC9jbGlwUGF0aD4KCQk8cGF0aCBjbGlwLXBhdGg9InVybCgjU1ZHSURfMjhfKSIgZmlsbD0iI0YzOEIwMCIgZD0iTTEyLjAxNywzLjI3M2MwLDAuMzA2LTAuMjg5LDAuNTU0LTAuNjUsMC41NDkKCQkJYy0wLjM2MSwwLTAuNjUtMC4yNDgtMC42NC0wLjU1M2MwLTAuMzExLDAuMjg5LTAuNTU5LDAuNjQtMC41NTNDMTEuNzI4LDIuNzE4LDEyLjAxNywyLjk3MSwxMi4wMTcsMy4yNzMiLz4KCTwvZz4KCTxnPgoJCTxkZWZzPgoJCQk8cmVjdCBpZD0iU1ZHSURfMjlfIiB5PSIwLjUzOSIgd2lkdGg9Ijc0IiBoZWlnaHQ9IjEwLjkyMiIvPgoJCTwvZGVmcz4KCQk8Y2xpcFBhdGggaWQ9IlNWR0lEXzMwXyI+CgkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzI5XyIgIG92ZXJmbG93PSJ2aXNpYmxlIi8+CgkJPC9jbGlwUGF0aD4KCQk8cGF0aCBjbGlwLXBhdGg9InVybCgjU1ZHSURfMzBfKSIgZmlsbD0iI0YzOEIwMCIgZD0iTTcyLjQ0MSwxLjA3NmgwLjUyNWMwLjEyNCwwLDAuMjE3LDAuMDI1LDAuMjc4LDAuMDc2CgkJCWMwLjA2MiwwLjA1OCwwLjA5MywwLjEzLDAuMDkzLDAuMjIzYzAsMC4wNTItMC4wMSwwLjEtMC4wMjksMC4xMzVjLTAuMDEyLDAuMDM2LTAuMDMxLDAuMDYyLTAuMDUzLDAuMDgyCgkJCXMtMC4wNDEsMC4wMzYtMC4wNjIsMC4wNDdjLTAuMDIxLDAuMDEtMC4wMjksMC4wMTYtMC4wNDEsMC4wMjFsMCwwYzAuMDEyLDAuMDA1LDAuMDMxLDAuMDExLDAuMDUzLDAuMDE2CgkJCWMwLjAyMSwwLjAxLDAuMDQxLDAuMDIxLDAuMDUyLDAuMDQxYzAuMDIxLDAuMDE2LDAuMDMxLDAuMDQxLDAuMDQxLDAuMDY3YzAuMDExLDAuMDMsMC4wMjEsMC4wNjcsMC4wMjEsMC4xMTIKCQkJYzAsMC4wNjIsMCwwLjEyNSwwLjAxMiwwLjE3N2MwLjAxLDAuMDUyLDAuMDMxLDAuMDkzLDAuMDUyLDAuMTEyaC0wLjIwN2MtMC4wMjEtMC4wMjEtMC4wMy0wLjA0NS0wLjAzLTAuMDc2czAtMC4wNTgsMC0wLjA4NAoJCQljMC0wLjA1MS0wLjAxMS0wLjA5OC0wLjAxMS0wLjEzM2MtMC4wMTEtMC4wMzctMC4wMjEtMC4wNjctMC4wNDEtMC4wOTRjLTAuMDExLTAuMDIxLTAuMDMtMC4wNDItMC4wNjItMC4wNTIKCQkJYy0wLjAzLTAuMDExLTAuMDYyLTAuMDE3LTAuMTEzLTAuMDE3aC0wLjI3N3YwLjQ1NWgtMC4xOTdWMS4wNzZINzIuNDQxeiBNNzIuNjM5LDEuNTgyaDAuMzE4YzAuMDYyLDAsMC4xMDQtMC4wMTYsMC4xMzUtMC4wNDcKCQkJYzAuMDMtMC4wMjUsMC4wNTMtMC4wNzIsMC4wNTMtMC4xMjljMC0wLjAzNi0wLjAxMi0wLjA2Ny0wLjAyMS0wLjA4OGMtMC4wMS0wLjAyMS0wLjAyMS0wLjA0MS0wLjA0MS0wLjA1MwoJCQljLTAuMDIxLTAuMDE2LTAuMDMxLTAuMDIxLTAuMDYyLTAuMDI0Yy0wLjAyMS0wLjAwNS0wLjA0MS0wLjAwNS0wLjA3MS0wLjAwNWgtMC4zMVYxLjU4MnoiLz4KCTwvZz4KCTxnPgoJCTxkZWZzPgoJCQk8cmVjdCBpZD0iU1ZHSURfMzFfIiB5PSIwLjUzOSIgd2lkdGg9Ijc0IiBoZWlnaHQ9IjEwLjkyMiIvPgoJCTwvZGVmcz4KCQk8Y2xpcFBhdGggaWQ9IlNWR0lEXzMyXyI+CgkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzMxXyIgIG92ZXJmbG93PSJ2aXNpYmxlIi8+CgkJPC9jbGlwUGF0aD4KCQk8cGF0aCBjbGlwLXBhdGg9InVybCgjU1ZHSURfMzJfKSIgZmlsbD0iI0YzOEIwMCIgZD0iTTcyLjg1NCwyLjgzNmMtMC42MjksMC0xLjE0Ni0wLjUxNi0xLjE0Ni0xLjE1CgkJCWMwLTAuNjI5LDAuNTE3LTEuMTQ2LDEuMTQ2LTEuMTQ2Uzc0LDEuMDU3LDc0LDEuNjg2Qzc0LDIuMzIsNzMuNDgyLDIuODM2LDcyLjg1NCwyLjgzNiBNNzIuODU0LDAuNzQ1CgkJCWMtMC41MTcsMC0wLjkzOCwwLjQyNC0wLjkzOCwwLjkzOGMwLDAuNTIxLDAuNDIzLDAuOTQ1LDAuOTM4LDAuOTQ1YzAuNTE3LDAsMC45MzktMC40MjQsMC45MzktMC45NDUKCQkJQzczLjc5NCwxLjE2OSw3My4zNywwLjc0NSw3Mi44NTQsMC43NDUiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K"

/***/ }),

/***/ 53:
/***/ (function(module, exports) {

module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

/***/ }),

/***/ 58:
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(53);
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};

/***/ }),

/***/ 62:
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(125);
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};

/***/ }),

/***/ 63:
/***/ (function(module, exports) {

module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};

/***/ }),

/***/ 64:
/***/ (function(module, exports, __webpack_require__) {

var dP         = __webpack_require__(48)
  , createDesc = __webpack_require__(95);
module.exports = __webpack_require__(42) ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};

/***/ }),

/***/ 815:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _VIE_Logo_RC = __webpack_require__(513);

var _VIE_Logo_RC2 = _interopRequireDefault(_VIE_Logo_RC);

var _Adapter = __webpack_require__(509);

var _Adapter2 = _interopRequireDefault(_Adapter);

var _brand = __webpack_require__(154);

var _brand2 = _interopRequireDefault(_brand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var version = "0.0.1";
var appUrl = "https://ringcentral.github.io/ringcentral-widget-demo" + '/app.html';

function init() {
  if (window.RCAdapter) {
    return;
  }
  window.RCAdapter = new _Adapter2.default({
    prefix: 'rc-integration',
    logoUrl: _VIE_Logo_RC2.default,
    appUrl: appUrl,
    brand: _brand2.default,
    version: version
  });
  setTimeout(function () {
    window.RCAdapter.init({
      size: { width: 300, height: 500 },
      minimized: false,
      closed: false,
      position: { translateX: 700, translateY: 20, minTranslateX: 0 }
    });
  }, 2000);
}

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}

/***/ }),

/***/ 9:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ 95:
/***/ (function(module, exports) {

module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};

/***/ })

/******/ });