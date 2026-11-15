import {fileURLToPath as __webpack_fileURLToPath__} from "node:url";
var __webpack_dirname__ = __webpack_fileURLToPath__(import.meta.url.replace(/\/(?:[^\/]*)$/, ""));
import * as __WEBPACK_EXTERNAL_MODULE_child_process__ from "child_process";
import * as __WEBPACK_EXTERNAL_MODULE_clientnode__ from "clientnode";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_array_includes_js_66c3fd7d__ from "core-js/modules/es.array.includes.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_array_push_js_baa3ea94__ from "core-js/modules/es.array.push.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_array_with_js_ee5e5ad1__ from "core-js/modules/es.array.with.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_iterator_constructor_js_833f4df9__ from "core-js/modules/es.iterator.constructor.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_iterator_filter_js_abae28b4__ from "core-js/modules/es.iterator.filter.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_iterator_for_each_js_2628f2dd__ from "core-js/modules/es.iterator.for-each.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_iterator_map_js_b8c7c9ee__ from "core-js/modules/es.iterator.map.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_json_parse_js_4d618d07__ from "core-js/modules/es.json.parse.js";
import * as __WEBPACK_EXTERNAL_MODULE_core_js_modules_es_json_stringify_js_ab8145f9__ from "core-js/modules/es.json.stringify.js";
import * as __WEBPACK_EXTERNAL_MODULE_fs__ from "fs";
import * as __WEBPACK_EXTERNAL_MODULE_fs_promises_cc1b69f3__ from "fs/promises";
import * as __WEBPACK_EXTERNAL_MODULE_node_fs_promises_06ebfe74__ from "node:fs/promises";
import * as __WEBPACK_EXTERNAL_MODULE_node_url_50af3bb5__ from "node:url";
import * as __WEBPACK_EXTERNAL_MODULE_path__ from "path";
/******/ var __webpack_modules__ = ([
/* 0 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ad: () => (/* binding */ hotReloadFiles),
/* harmony export */   Ay: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   GH: () => (/* binding */ isInLocations),
/* harmony export */   Gy: () => (/* binding */ determineInternalName),
/* harmony export */   Hh: () => (/* binding */ load),
/* harmony export */   MM: () => (/* binding */ pluginAPI),
/* harmony export */   Oy: () => (/* binding */ createNativeAPIFactory),
/* harmony export */   TV: () => (/* binding */ isExecutable),
/* harmony export */   Vx: () => (/* binding */ hotReloadConfigurationFile),
/* harmony export */   XK: () => (/* binding */ createExecutableAPIFactory),
/* harmony export */   ZN: () => (/* binding */ loadFile),
/* harmony export */   c0: () => (/* binding */ combinePluginConfigurations),
/* harmony export */   dw: () => (/* binding */ hotReloadAPIFile),
/* harmony export */   e7: () => (/* binding */ gatherConfigurationFilePaths),
/* harmony export */   gh: () => (/* binding */ loadAll),
/* harmony export */   gl: () => (/* binding */ callStackSynchronous),
/* harmony export */   i9: () => (/* binding */ loadConfigurations),
/* harmony export */   lT: () => (/* binding */ _callStack),
/* harmony export */   m7: () => (/* binding */ determineLocations),
/* harmony export */   nQ: () => (/* binding */ loadAPI),
/* harmony export */   u2: () => (/* binding */ evaluateConfiguration),
/* harmony export */   vF: () => (/* binding */ loadConfiguration),
/* harmony export */   zW: () => (/* binding */ PLUGIN_PRELOADER)
/* harmony export */ });
/* unused harmony export log */
/* harmony import */ var core_js_modules_es_array_includes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);
/* harmony import */ var core_js_modules_es_array_with_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(15);
/* harmony import */ var core_js_modules_es_iterator_constructor_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2);
/* harmony import */ var core_js_modules_es_iterator_filter_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3);
/* harmony import */ var core_js_modules_es_iterator_for_each_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4);
/* harmony import */ var core_js_modules_es_iterator_map_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(8);
/* harmony import */ var core_js_modules_es_json_parse_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(16);
/* harmony import */ var core_js_modules_es_json_stringify_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(17);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(18);
/* harmony import */ var clientnode__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(5);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(9);
/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(10);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(11);
/* harmony import */ var _configurator_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(7);
/* module decorator */ module = __webpack_require__.hmd(module);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_configurator_js__WEBPACK_IMPORTED_MODULE_14__]);
var __webpack_async_dependencies_result__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
_configurator_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_async_dependencies_result__[0];
// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module pluginAPI *//* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 4.0 international license.
    See https://creativecommons.org/licenses/by/4.0/deed.de
    endregion
*/// region imports
function _toConsumableArray(a){return _arrayWithoutHoles(a)||_iterableToArray(a)||_unsupportedIterableToArray(a)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArray(r){var e="undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(Array.isArray(r)&&(null==e||e===("undefined"!=typeof Symbol&&[][Symbol.iterator])||e===[]["@@iterator"]))return r;if(null!=e){for(var t,o=[],a=e.call(r);!(t=a.next()).done;)o.push(t.value);return o}}function _arrayWithoutHoles(a){if(Array.isArray(a))return _arrayLikeToArray(a)}function _slicedToArray(e,i){return _iterableToArrayLimit(e,i)||_unsupportedIterableToArray(e,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArrayLimit(r,t){var e=null==r?null:"undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(Array.isArray(r)&&(null==e||e===("undefined"!=typeof Symbol&&[][Symbol.iterator])||e===[]["@@iterator"]))return r;if(null!=e){var l,n,i,a,u=[],o=!0,f=!1;try{if(i=(e=e.call(r)).next,0===t){if(Object(e)!==e)return;o=!1}else for(;!(o=(l=i.call(e)).done)&&(u.push(l.value),u.length!==t);o=!0);}catch(r){f=!0,n=r}finally{try{if(!o&&null!=e.return&&(a=e.return(),Object(a)!==a))return}finally{if(f)throw n}}return u}}function _regenerator(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */var r,e,o="function"==typeof Symbol?Symbol:{},n=o.iterator||"@@iterator",a=o.toStringTag||"@@toStringTag";function i(o,n,a,i){var u=n&&n.prototype instanceof Generator?n:Generator,f=Object.create(u.prototype);return _regeneratorDefine2(f,"_invoke",function(t,o,n){var a,i,u,f=0,p=n||[],y=!1,G={p:0,n:0,v:r,a:l,f:l.bind(r,4),d:function d(t,e){return a=t,i=0,u=r,G.n=e,c}};function l(t,o){for(i=t,u=o,e=0;!y&&f&&!n&&e<p.length;e++){var n,a=p[e],l=G.p,F=a[2];t>3?(n=F===o)&&(u=a[(i=a[4])?5:(i=3,3)],a[4]=a[5]=r):a[0]<=l&&((n=t<2&&l<a[1])?(i=0,G.v=o,G.n=a[1]):l<F&&(n=t<3||a[0]>o||o>F)&&(a[4]=t,a[5]=o,G.n=F,i=0))}if(n||t>1)return c;throw y=!0,o}return function(n,p,F){if(f>1)throw TypeError("Generator is already running");for(y&&1===p&&l(p,F),i=p,u=F;(e=i<2?r:u)||!y;){a||(i?i<3?(i>1&&(G.n=-1),l(i,u)):G.n=u:G.v=u);try{if(f=2,a){if(i||(n="next"),e=a[n]){if(!(e=e.call(a,u)))throw TypeError("iterator result is not an object");if(!e.done)return e;u=e.value,i<2&&(i=0)}else 1===i&&(e=a.return)&&e.call(a),i<2&&(u=TypeError("The iterator does not provide a '"+n+"' method"),i=1);a=r}else if((e=(y=G.n<0)?u:t.call(o,G))!==c)break}catch(t){a=r,i=1,u=t}finally{f=1}}return{value:e,done:y}}}(o,a,i),!0),f}var c={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}e=Object.getPrototypeOf;var u=[][n]?e(e([][n]())):(_regeneratorDefine2(e={},n,function(){return this}),e),f=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(u);function p(r){return Object.setPrototypeOf?Object.setPrototypeOf(r,GeneratorFunctionPrototype):(r.__proto__=GeneratorFunctionPrototype,_regeneratorDefine2(r,a,"GeneratorFunction")),r.prototype=Object.create(f),r}return GeneratorFunction.prototype=GeneratorFunctionPrototype,_regeneratorDefine2(f,"constructor",GeneratorFunctionPrototype),_regeneratorDefine2(GeneratorFunctionPrototype,"constructor",GeneratorFunction),GeneratorFunction.displayName="GeneratorFunction",_regeneratorDefine2(GeneratorFunctionPrototype,a,"GeneratorFunction"),_regeneratorDefine2(f),_regeneratorDefine2(f,a,"Generator"),_regeneratorDefine2(f,n,function(){return this}),_regeneratorDefine2(f,"toString",function(){return"[object Generator]"}),(_regenerator=function _regenerator(){return{w:i,m:p}})()}function _regeneratorDefine2(e,r,n,t){var i=Object.defineProperty;try{i({},"",{})}catch(e){i=0}_regeneratorDefine2=function _regeneratorDefine(e,r,n,t){function o(r,n){_regeneratorDefine2(e,r,function(e){return this._invoke(r,n,e)})}r?i?i(e,r,{value:n,enumerable:!t,configurable:!t,writable:!t}):e[r]=n:(o("next",0),o("throw",1),o("return",2))},_regeneratorDefine2(e,r,n,t)}function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function _createForOfIteratorHelper(e,t){var _n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!_n){if(Array.isArray(e)||(_n=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){_n&&(e=_n);var o=0,F=function F(){};return{s:F,n:function n(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function e(r){throw r},f:F}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,u,i=!0;return{s:function s(){_n=_n.call(e)},n:function n(){i=!0;var r=_n.next();return r.done?{done:!0}:{value:r.value,done:i=!1}},e:function e(r){a=!0,u=r},f:function f(){try{i||null==_n.return||_n.return()}finally{if(a)throw u}}}}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var o={}.toString.call(t).slice(8,-1);return"Object"===o&&t.constructor&&(o=t.constructor.name),"Map"===o||"Set"===o?Array.from(t):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?_arrayLikeToArray(t,e):void 0}}function _arrayLikeToArray(r,a){(null==a||a>r.length)&&(a=r.length);for(var e=0,n=Array(a);e<a;e++)n[e]=r[e];return n};function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(o),!0).forEach(function(t){_defineProperty(r,t,o[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):ownKeys(Object(o)).forEach(function(e){Object.defineProperty(r,e,Object.getOwnPropertyDescriptor(o,e))})}return r}function _defineProperty(r,t,o){return(t=_toPropertyKey(t))in r?Object.defineProperty(r,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):r[t]=o,r}function _toPropertyKey(r){var o=_toPrimitive(r,"string");return"symbol"==_typeof(o)?o:o+""}function _toPrimitive(t,e){if("object"!=_typeof(t)||!t)return t;var r;if("undefined"!=typeof Symbol&&void 0!==(r=t[Symbol.toPrimitive])){var i=r.call(t,e||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}function asyncGeneratorStep(n,t,e,r,o,a,c){try{var i=n[a](c),u=i.value}catch(n){return void e(n)}i.done?t(u):Promise.resolve(u).then(r,o)}function _asyncToGenerator(n){return function(){var t=this,e=arguments;return new Promise(function(r,o){var a=n.apply(t,e);function _next(n){asyncGeneratorStep(a,r,o,_next,_throw,"next",n)}function _throw(n){asyncGeneratorStep(a,r,o,_next,_throw,"throw",n)}_next(void 0)})}};// endregion
var log=new clientnode__WEBPACK_IMPORTED_MODULE_10__.Logger({name:"web-node.plugin-api"});var PLUGIN_PRELOADER={};await (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.importFilesystemAPI)();/**
 * Calls all plugin methods for given trigger description asynchronous and
 * waits for their resolved promises.
 * @param givenState - Contains runtime information about current hook.
 * @param parameters - Additional parameters to forward into plugin api.
 * @returns A promise which resolves when all callbacks have resolved their
 * promise holding given potentially modified data.
 */var _callStack=/*#__PURE__*/function(){var _callStack2=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(givenState){var state,configuration,hook,plugins,isConfigurationHook,pluginsWithChangedConfiguration,localState,pluginsWithChangedAPIFiles,data,_len,parameters,_key,_iterator,_step,plugin,result,_message,_args=arguments,_t,_t2;return _regenerator().w(function(_context){while(1)switch(_context.p=_context.n){case 0:state=_objectSpread(_objectSpread({},givenState),{},{pluginAPI:pluginAPI});configuration=state.configuration,hook=state.hook,plugins=state.plugins;isConfigurationHook=hook.endsWith("ConfigurationLoaded")||hook.endsWith("ConfigurationHotLoaded");if(!configuration.core.plugin.hotReloading){_context.n=6;break}if(isConfigurationHook){_context.n=4;break}_context.n=1;return hotReloadConfigurationFile(plugins,configuration.core.plugin.configuration.propertyNames);case 1:pluginsWithChangedConfiguration=_context.v;if(!pluginsWithChangedConfiguration.length){_context.n=4;break}void log.info("Configuration for \""+pluginsWithChangedConfiguration.map(function(plugin){return plugin.name}).join("\", \"")+"\" has been changed: reloading initialized.");localState=_objectSpread(_objectSpread({},state),{},{triggerHook:state.hook,pluginsWithChangedConfiguration:pluginsWithChangedConfiguration});_context.n=2;return _callStack(_objectSpread(_objectSpread({},localState),{},{hook:"preConfigurationHotLoaded"}));case 2:_context.n=3;return loadConfigurations(plugins,configuration);case 3:_context.n=4;return _callStack(_objectSpread(_objectSpread({},localState),{},{hook:"postConfigurationHotLoaded"}));case 4:if(!(hook!=="apiFileReloaded")){_context.n=6;break}_context.n=5;return hotReloadAPIFile(plugins);case 5:pluginsWithChangedAPIFiles=_context.v;if(!pluginsWithChangedAPIFiles.length){_context.n=6;break}void log.info("API-file for \""+"".concat(pluginsWithChangedAPIFiles.map(function(plugin){return plugin.name}).join("\", \""),"\""),"has been changed: reloading initialized.");_context.n=6;return _callStack(_objectSpread(_objectSpread({},state),{},{hook:"apiFileReloaded",pluginsWithChangedAPIFiles:pluginsWithChangedAPIFiles,triggerHook:state.hook}));case 6:data=givenState.data;for(_len=_args.length,parameters=new Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){parameters[_key-1]=_args[_key]}_iterator=_createForOfIteratorHelper(plugins);_context.p=7;_iterator.s();case 8:if((_step=_iterator.n()).done){_context.n=15;break}plugin=_step.value;if(!plugin.api){_context.n=14;break}result=void 0;_context.p=9;_context.n=10;return plugin.api.apply(plugin,[state].concat(parameters));case 10:result=_context.v;_context.n=13;break;case 11:_context.p=11;_t=_context.v;if(!((_message=_t.message)!==null&&_message!==void 0&&_message.startsWith("NotImplemented:"))){_context.n=12;break}return _context.a(3,14);case 12:throw new Error("Plugin \"".concat(plugin.internalName,"\" ")+(plugin.internalName===plugin.name?"":"(".concat(plugin.name,") "))+"throws: ".concat((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.represent)(_t)," during asynchronous ")+"hook \"".concat(hook,"\"."),{cause:_t});case 13:data=result;void log.info("Ran asynchronous hook \"".concat(hook,"\" for plugin \"").concat(plugin.name,"\"."));case 14:_context.n=8;break;case 15:_context.n=17;break;case 16:_context.p=16;_t2=_context.v;_iterator.e(_t2);case 17:_context.p=17;_iterator.f();return _context.f(17);case 18:if(!(data!==null&&_typeof(data)==="object"&&"then"in data)){_context.n=19;break}return _context.a(2,{promise:data});case 19:return _context.a(2,data)}},_callee,null,[[9,11],[7,16,17,18]])}));function callStack(_x){return _callStack2.apply(this,arguments)}return callStack}();/**
 * Calls all plugin methods for given trigger description synchronous.
 * @param givenState - Contains runtime information about current hook.
 * @param parameters - Additional parameters to forward into plugin api.
 * @returns Given potentially modified data.
 */var callStackSynchronous=function callStackSynchronous(givenState){var state=_objectSpread(_objectSpread({},givenState),{},{pluginAPI:pluginAPI});var configuration=state.configuration,hook=state.hook,plugins=state.plugins;var data=givenState.data;for(var _len2=arguments.length,parameters=new Array(_len2>1?_len2-1:0),_key2=1;_key2<_len2;_key2++){parameters[_key2-1]=arguments[_key2]}var _iterator2=_createForOfIteratorHelper(plugins),_step2;try{for(_iterator2.s();!(_step2=_iterator2.n()).done;){var plugin=_step2.value;if(plugin.api){var result=void 0;try{result=plugin.api.apply(plugin,[state].concat(parameters))}catch(error){var _message2;if((_message2=error.message)!==null&&_message2!==void 0&&_message2.startsWith("NotImplemented:"))continue;throw new Error("Plugin \"".concat(plugin.internalName,"\" ")+(plugin.internalName===plugin.name?"":"(".concat(plugin.name,") "))+"throws: ".concat((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.represent)(error)," during synchronous hook")+"\"".concat(hook,"\"."),{cause:error})}data=result;if(configuration.core.debug)void log.info("Ran synchronous hook \"".concat(hook,"\" for plugin"),"\"".concat(plugin.name,"\"."))}}}catch(err){_iterator2.e(err)}finally{_iterator2.f()}return data};/**
 * Converts given plugin name into the corresponding internal representation.
 * @param name - Name to convert.
 * @param regularExpression - Regular expression pattern which extracts
 * relevant name path as first match group.
 * @returns Transformed name.
 */var determineInternalName=function determineInternalName(name,regularExpression){return (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.delimitedToCamelCase)(name.replace(regularExpression,function(fullMatch,firstMatch){return typeof firstMatch==="string"?firstMatch:fullMatch}))};/**
 * Evaluates given configuration object by letting plugins package sub
 * structure untouched.
 * @param configuration - Evaluable configuration structure.
 * @returns Resolved configuration.
 */var evaluateConfiguration=/*#__PURE__*/function(){var _evaluateConfiguration=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(configuration){var pluginPackageConfigurationBackup,_i,_Object$entries,_Object$entries$_i,name,subConfiguration,now,evaluationOptions,_i2,_Object$entries2,_Object$entries2$_i,_name,pluginPackageConfiguration;return _regenerator().w(function(_context2){while(1)switch(_context2.n){case 0:/*
        NOTE: We have to back up, remove and restore all plugin specific
        package configuration to avoid evaluation non web node#
        configuration structures.
    */pluginPackageConfigurationBackup={};for(_i=0,_Object$entries=Object.entries(configuration);_i<_Object$entries.length;_i++){_Object$entries$_i=_slicedToArray(_Object$entries[_i],2),name=_Object$entries$_i[0],subConfiguration=_Object$entries$_i[1];if(subConfiguration.package){pluginPackageConfigurationBackup[name]=subConfiguration.package;delete subConfiguration.package}}now=new Date;evaluationOptions={scope:_objectSpread(_objectSpread({},clientnode__WEBPACK_IMPORTED_MODULE_10__.UTILITY_SCOPE),{},{currentPath:process.cwd(),fs:fs_promises__WEBPACK_IMPORTED_MODULE_12__["default"],path:path__WEBPACK_IMPORTED_MODULE_13__["default"],module:module,// NOTE: This module is bundled into the "dist/" folder.
webNodePath:(0,path__WEBPACK_IMPORTED_MODULE_13__.resolve)(__webpack_dirname__,".."),now:now,nowUTCTimestamp:(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.getUTCTimestamp)(now)})};_context2.n=1;return (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.evaluateAsyncDynamicData)((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.evaluateDynamicData)((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.removeKeysInEvaluation)(configuration),_objectSpread(_objectSpread({},evaluationOptions),{},{scope:_objectSpread(_objectSpread({},evaluationOptions.scope),{},{fs:fs__WEBPACK_IMPORTED_MODULE_11__["default"]})})),evaluationOptions);case 1:configuration=_context2.v;for(_i2=0,_Object$entries2=Object.entries(pluginPackageConfigurationBackup);_i2<_Object$entries2.length;_i2++){_Object$entries2$_i=_slicedToArray(_Object$entries2[_i2],2),_name=_Object$entries2$_i[0],pluginPackageConfiguration=_Object$entries2$_i[1];configuration[_name].package=pluginPackageConfiguration}return _context2.a(2,configuration)}},_callee2)}));function evaluateConfiguration(_x2){return _evaluateConfiguration.apply(this,arguments)}return evaluateConfiguration}();/**
 * Checks for changed plugin api file in given plugins and reloads them if
 * necessary (new timestamp).
 * @param plugins - List of plugins to search for updates in.
 * @returns A list with plugins which have a changed api scope.
 */var hotReloadAPIFile=/*#__PURE__*/function(){var _hotReloadAPIFile=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(plugins){var pluginsWithChangedFiles,pluginChanges,_iterator3,_step3,pluginChange,_i3,_Object$entries3,_Object$entries3$_i,name,value,propertyDescriptor,isWritable;return _regenerator().w(function(_context3){while(1)switch(_context3.n){case 0:pluginsWithChangedFiles=[];_context3.n=1;return hotReloadFiles("api","scope",plugins);case 1:pluginChanges=_context3.v;_iterator3=_createForOfIteratorHelper(pluginChanges);try{for(_iterator3.s();!(_step3=_iterator3.n()).done;){pluginChange=_step3.value;if(pluginChange.oldScope){// NOTE: We have to migrate old plugin api's scope state.
for(_i3=0,_Object$entries3=Object.entries(pluginChange.oldScope);_i3<_Object$entries3.length;_i3++){_Object$entries3$_i=_slicedToArray(_Object$entries3[_i3],2),name=_Object$entries3$_i[0],value=_Object$entries3$_i[1];if(Object.prototype.hasOwnProperty.call(pluginChange.newScope,name)&&!(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.isFunction)(pluginChange.newScope[name])){propertyDescriptor=Object.getOwnPropertyDescriptor(pluginChange.newScope,name);isWritable=true;if(propertyDescriptor){isWritable=propertyDescriptor.writable!==false;if(propertyDescriptor.configurable&&!isWritable)Object.defineProperties(pluginChange.newScope,_defineProperty({},name,{writable:true}))}try{pluginChange.newScope[name]=value}catch(_unused){void log.warn("Could not update new constant value for","variable \"".concat(name,"\"."))}if(!isWritable&&propertyDescriptor!==null&&propertyDescriptor!==void 0&&propertyDescriptor.configurable)Object.defineProperties(pluginChange.newScope,_defineProperty({},name,{writable:false}))}}pluginsWithChangedFiles.push(pluginChange.plugin)}}}catch(err){_iterator3.e(err)}finally{_iterator3.f()}return _context3.a(2,pluginsWithChangedFiles)}},_callee3)}));function hotReloadAPIFile(_x3){return _hotReloadAPIFile.apply(this,arguments)}return hotReloadAPIFile}();/**
 * Checks for changed plugin configurations in given plugins and reloads them
 * if necessary (new timestamp).
 * @param plugins - List of plugins to search for updates in.
 * @param configurationPropertyNames - Property names to search for to use as
 * entry in plugin configuration file.
 * @returns A list with plugins which have a changed configurations.
 */var hotReloadConfigurationFile=/*#__PURE__*/function(){var _hotReloadConfigurationFile=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(plugins,configurationPropertyNames){var pluginsWithChangedFiles,_iterator4,_step4,plugin,timestamps,hasChanged,_i4,_Object$entries4,_Object$entries4$_i,index,filePath,timestamp,sourceConfigurations,_iterator5,_step5,_filePath,_combinePluginConfigu,name,configuration,_t3,_t4,_t5,_t6;return _regenerator().w(function(_context4){while(1)switch(_context4.p=_context4.n){case 0:pluginsWithChangedFiles=[];_iterator4=_createForOfIteratorHelper(plugins);_context4.p=1;_iterator4.s();case 2:if((_step4=_iterator4.n()).done){_context4.n=20;break}plugin=_step4.value;timestamps=[];hasChanged=false;_i4=0,_Object$entries4=Object.entries(plugin.configurationFilePaths);case 3:if(!(_i4<_Object$entries4.length)){_context4.n=6;break}_Object$entries4$_i=_slicedToArray(_Object$entries4[_i4],2),index=_Object$entries4$_i[0],filePath=_Object$entries4$_i[1];_context4.n=4;return (0,fs_promises__WEBPACK_IMPORTED_MODULE_12__.stat)(filePath);case 4:timestamp=_context4.v.mtime.getTime();if(plugin.configurationFileLoadTimestamps[Number(index)]<timestamp){void log.info("Determined updated file \"".concat(filePath,"\"."),"Doing a reload.");hasChanged=true}timestamps.push(timestamp);case 5:_i4++;_context4.n=3;break;case 6:plugin.configurationFileLoadTimestamps=timestamps;if(hasChanged){_context4.n=7;break}return _context4.a(3,19);case 7:/*
            NOTE: All configuration files have to be combined again (as done
            initially in "load") since a single one only holds a part of the
            plugins configuration (e.g. "package.json" and
            "private-package.json"). They have to be loaded freshly since
            combining consumes their modification expressions.
        */sourceConfigurations=[];_context4.p=8;_iterator5=_createForOfIteratorHelper(plugin.configurationFilePaths);_context4.p=9;_iterator5.s();case 10:if((_step5=_iterator5.n()).done){_context4.n=13;break}_filePath=_step5.value;_t3=sourceConfigurations;_context4.n=11;return loadFile(_filePath,plugin.name);case 11:_t3.push.call(_t3,_context4.v);case 12:_context4.n=10;break;case 13:_context4.n=15;break;case 14:_context4.p=14;_t4=_context4.v;_iterator5.e(_t4);case 15:_context4.p=15;_iterator5.f();return _context4.f(15);case 16:_context4.n=18;break;case 17:_context4.p=17;_t5=_context4.v;void log.warn("Could not reload configuration files of plugin","\"".concat(plugin.name,"\": ").concat((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.represent)(_t5),". Using old one."));return _context4.a(3,19);case 18:_combinePluginConfigu=combinePluginConfigurations(plugin.internalName,sourceConfigurations,configurationPropertyNames),name=_combinePluginConfigu.name,configuration=_combinePluginConfigu.configuration;plugin.configuration=configuration;plugin.packageConfiguration=configuration[name].package;void log.info("Configuration files \"".concat(plugin.configurationFilePaths.join("\", \""),"\" reloaded."));pluginsWithChangedFiles.push(plugin);case 19:_context4.n=2;break;case 20:_context4.n=22;break;case 21:_context4.p=21;_t6=_context4.v;_iterator4.e(_t6);case 22:_context4.p=22;_iterator4.f();return _context4.f(22);case 23:return _context4.a(2,pluginsWithChangedFiles)}},_callee4,null,[[9,14,15,16],[8,17],[1,21,22,23]])}));function hotReloadConfigurationFile(_x4,_x5){return _hotReloadConfigurationFile.apply(this,arguments)}return hotReloadConfigurationFile}();/**
 * Checks for changed plugin file type in given plugins and reloads them if
 * necessary (timestamp has changed).
 * @param type - Plugin file type to search for updates.
 * @param target - Property name existing in plugin meta information objects
 * which should be updated.
 * @param plugins - List of plugins to search for updates in.
 * @returns A list with plugin changes.
 */var hotReloadFiles=/*#__PURE__*/function(){var _hotReloadFiles=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(type,target,plugins){var pluginChanges,_iterator6,_step6,plugin,index,_iterator7,_step7,filePath,timestamp,oldScope,_t7,_t8;return _regenerator().w(function(_context5){while(1)switch(_context5.p=_context5.n){case 0:pluginChanges=[];_iterator6=_createForOfIteratorHelper(plugins);_context5.p=1;_iterator6.s();case 2:if((_step6=_iterator6.n()).done){_context5.n=13;break}plugin=_step6.value;if(!plugin[target]){_context5.n=12;break}index=0;_iterator7=_createForOfIteratorHelper(plugin["".concat(type,"FilePaths")]);_context5.p=3;_iterator7.s();case 4:if((_step7=_iterator7.n()).done){_context5.n=9;break}filePath=_step7.value;_context5.n=5;return (0,fs_promises__WEBPACK_IMPORTED_MODULE_12__.stat)(filePath);case 5:timestamp=_context5.v.mtime.getTime();if(!(plugin["".concat(type,"FileLoadTimestamps")][index]<timestamp)){_context5.n=7;break}void log.info("Determined updated file \"".concat(filePath,"\"."),"Doing a reload.");oldScope=plugin[target];_context5.n=6;return loadFile(filePath,plugin.name,plugin[target]);case 6:plugin[target]=_context5.v;void log.info("File \"".concat(filePath,"\" reloaded."));pluginChanges.push({newScope:plugin[target],oldScope:oldScope,plugin:plugin,target:target});case 7:plugin["".concat(type,"FileLoadTimestamps")][index]=timestamp;index+=1;case 8:_context5.n=4;break;case 9:_context5.n=11;break;case 10:_context5.p=10;_t7=_context5.v;_iterator7.e(_t7);case 11:_context5.p=11;_iterator7.f();return _context5.f(11);case 12:_context5.n=2;break;case 13:_context5.n=15;break;case 14:_context5.p=14;_t8=_context5.v;_iterator6.e(_t8);case 15:_context5.p=15;_iterator6.f();return _context5.f(15);case 16:return _context5.a(2,pluginChanges)}},_callee5,null,[[3,10,11,12],[1,14,15,16]])}));function hotReloadFiles(_x6,_x7,_x8){return _hotReloadFiles.apply(this,arguments)}return hotReloadFiles}();/**
 * Combines given plugin configurations into one and returns a plugin specific
 * meta information object.
 * @param name - Name of the plugin.
 * @param configurations - Array of plugin configurations to combine.
 * @param propertyNames - Array of property names to consider in the
 * configuration.
 * @returns An object of plugin specific meta information.
 */var combinePluginConfigurations=function combinePluginConfigurations(name,configurations,propertyNames){if(propertyNames===void 0){propertyNames=["webNode"]}var packageConfiguration={};var _iterator8=_createForOfIteratorHelper(configurations),_step8;try{for(_iterator8.s();!(_step8=_iterator8.n()).done;){var configuration=_step8.value;(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.extend)(true,/*
                NOTE: Source and target configuration got modified. While the
                target configuration receives the modifications the source
                configuration will lose their modification expressions
                therefore we can use the source configuration afterward to
                extend the target configuration.
            */(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.modifyObject)(packageConfiguration,configuration),configuration)}}catch(err){_iterator8.e(err)}finally{_iterator8.f()}name=packageConfiguration.webNodeInternalName||name;return{name:name,configuration:loadConfiguration(name,packageConfiguration,propertyNames)}};/**
 * Extends given configuration object with given plugin specific ones and
 * returns a plugin specific meta information object.
 * @param name - Name of plugin to extend.
 * @param internalName - Internal name of plugin to extend.
 * @param plugins - List of all yet determined plugin information.
 * @param metaConfiguration - Configuration file configuration.
 * @param pluginPath - Path to given plugin.
 * @param encoding - Encoding to use to read and write from child process's.
 * @returns An object of plugin specific meta information.
 */var load=/*#__PURE__*/function(){var _load=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(name,internalName,plugins,metaConfiguration,pluginPath,encoding){var configurationFilePaths,sourceConfigurations,_iterator9,_step9,filePath,_combinePluginConfigu2,resolvedInternalName,configuration,apiFilePaths,_t9,_t0;return _regenerator().w(function(_context6){while(1)switch(_context6.p=_context6.n){case 0:if(encoding===void 0){encoding="utf8"}_context6.n=1;return gatherConfigurationFilePaths(pluginPath,metaConfiguration.fileNames);case 1:configurationFilePaths=_context6.v;sourceConfigurations=[];_iterator9=_createForOfIteratorHelper(configurationFilePaths);_context6.p=2;_iterator9.s();case 3:if((_step9=_iterator9.n()).done){_context6.n=6;break}filePath=_step9.value;_t9=sourceConfigurations;_context6.n=4;return loadFile(filePath,name);case 4:_t9.push.call(_t9,_context6.v);case 5:_context6.n=3;break;case 6:_context6.n=8;break;case 7:_context6.p=7;_t0=_context6.v;_iterator9.e(_t0);case 8:_context6.p=8;_iterator9.f();return _context6.f(8);case 9:_combinePluginConfigu2=combinePluginConfigurations(internalName,sourceConfigurations,metaConfiguration.propertyNames),resolvedInternalName=_combinePluginConfigu2.name,configuration=_combinePluginConfigu2.configuration;apiFilePaths=["index.js"];if(!Object.keys(configuration[resolvedInternalName].package).length){_context6.n=11;break}if(configuration[resolvedInternalName].package.main)apiFilePaths[0]=configuration[resolvedInternalName].package.main;_context6.n=10;return loadAPI(apiFilePaths,pluginPath,name,resolvedInternalName,plugins,encoding,configuration,configurationFilePaths);case 10:return _context6.a(2,_context6.v);case 11:_context6.n=12;return loadAPI(apiFilePaths,pluginPath,name,resolvedInternalName,plugins,encoding);case 12:return _context6.a(2,_context6.v)}},_callee6,null,[[2,7,8,9]])}));function load(_x9,_x0,_x1,_x10,_x11,_x12){return _load.apply(this,arguments)}return load}();/**
 * Checks whether given file can be executed by the current user.
 * @param filePath - Path to the file to check.
 * @returns A promise resolving to a boolean indicating whether given file is
 * executable.
 */var isExecutable=/*#__PURE__*/function(){var _isExecutable=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(filePath){var _t1;return _regenerator().w(function(_context7){while(1)switch(_context7.p=_context7.n){case 0:_context7.p=0;_context7.n=1;return (0,fs_promises__WEBPACK_IMPORTED_MODULE_12__.access)(filePath,fs_promises__WEBPACK_IMPORTED_MODULE_12__.constants.X_OK);case 1:return _context7.a(2,true);case 2:_context7.p=2;_t1=_context7.v;return _context7.a(2,false)}},_callee7,null,[[0,2]])}));function isExecutable(_x13){return _isExecutable.apply(this,arguments)}return isExecutable}();/**
 * Creates a function callable by plugin api which calls the corresponding
 * plugin scope method.
 * @param plugins - To search for plugin scope in.
 * @param name - Name of plugin to search for.
 * @returns A function which calls the corresponding plugin scope method.
 */var createNativeAPIFactory=function createNativeAPIFactory(plugins,name){return function(state){var _ref;for(var _len3=arguments.length,parameters=new Array(_len3>1?_len3-1:0),_key3=1;_key3<_len3;_key3++){parameters[_key3-1]=arguments[_key3]}if(plugins[name].scope&&state.hook in plugins[name].scope)return(_ref=plugins[name].scope)[state.hook].apply(_ref,[state].concat(parameters));throw new Error("NotImplemented: API method \"".concat(state.hook,"\" is not ")+"implemented in plugin \"".concat(name,"\"."))}};/**
 * Creates a function callable by plugin api which runs given executable. The
 * executable gets the hook name and all additional parameters (JSON encoded)
 * as arguments and the current data (JSON encoded) via standard input. It has
 * to print a JSON object to standard output. Its "result" property is used
 * as return value. A "status" of 404 indicates a not implemented hook, any
 * other status from 400 on indicates an error described by an optional
 * "message" property. Without an error status a given "message" is logged.
 * @param filePath - Path to the executable to run.
 * @param name - Name of corresponding plugin to use for proper error
 * messages.
 * @param encoding - Encoding to use to read and write from child process.
 * @returns A function which runs the given executable.
 */var createExecutableAPIFactory=function createExecutableAPIFactory(filePath,name,encoding){if(encoding===void 0){encoding="utf8"}return function(_ref2){var data=_ref2.data,hook=_ref2.hook;for(var _len4=arguments.length,parameters=new Array(_len4>1?_len4-1:0),_key4=1;_key4<_len4;_key4++){parameters[_key4-1]=arguments[_key4]}var childProcessResult=(0,child_process__WEBPACK_IMPORTED_MODULE_9__.spawnSync)(filePath,[hook].concat(_toConsumableArray(parameters.map(function(item){return(// NOTE: "undefined" is not representable in JSON.
item===undefined?"null":JSON.stringify(item))}))),{cwd:process.cwd(),encoding:encoding,env:process.env,input:data===undefined?"null":JSON.stringify(data),// NOTE: Let error output reach the user directly.
stdio:["pipe","pipe","inherit"]});if(childProcessResult.error)throw childProcessResult.error;if(childProcessResult.status!==0)throw new Error("API executable \"".concat(filePath,"\" of plugin \"").concat(name,"\" exited ")+"with code ".concat(String(childProcessResult.status)," during hook ")+"\"".concat(hook,"\"."));var response;try{response=JSON.parse(childProcessResult.stdout)}catch(error){throw new Error("API executable \"".concat(filePath,"\" of plugin \"").concat(name,"\" did not ")+"return valid JSON during hook \"".concat(hook,"\": ")+(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.represent)(error),{cause:error})}if(!(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.isPlainObject)(response))throw new Error("API executable \"".concat(filePath,"\" of plugin \"").concat(name,"\" has to ")+"return a JSON object during hook \"".concat(hook,"\"."));var _ref3=response,message=_ref3.message,result=_ref3.result,status=_ref3.status;if(status===404)throw new Error("NotImplemented: API method \"".concat(hook,"\" is not implemented ")+"in plugin \"".concat(name,"\"."));if(typeof status==="number"&&status>=400)throw new Error("API executable \"".concat(filePath,"\" of plugin \"").concat(name,"\" ")+"responded with status ".concat(String(status)," during hook ")+"\"".concat(hook,"\"")+(message?": ".concat(message):"."));if(message)void log.info("Plugin \"".concat(name,"\" during hook \"").concat(hook,"\": ").concat(message));return result}};/**
 * Load given plugin api file in given path and generates a plugin specific
 * data structure with useful meta information.
 * @param relativeFilePaths - Paths to file to load relatively from given
 * plugin path.
 * @param pluginPath - Path to plugin directory.
 * @param name - Plugin name to use for proper error messages.
 * @param internalName - Internal plugin name to use for proper error messages.
 * @param plugins - List of plugins to search for trigger callbacks in.
 * @param encoding - Encoding to use to read and write from child process.
 * @param configuration - Plugin specific configurations.
 * @param configurationFilePaths - Plugin specific configuration file paths.
 * @returns Plugin meta information object.
 */var loadAPI=/*#__PURE__*/function(){var _loadAPI=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(relativeFilePaths,pluginPath,name,internalName,plugins,encoding,configuration,configurationFilePaths){var filePath,configurationFileNames,_iterator0,_step0,fileName,candidate,api,nativeAPI,pluginConfiguration,hasPluginConfiguration,scope,_t10,_t11,_t12,_t13,_t14,_t15,_t16,_t17,_t18,_t19,_t20,_t21,_t22,_t23,_t24,_t25,_t26,_t27,_t28,_t29,_t30,_t31;return _regenerator().w(function(_context9){while(1)switch(_context9.p=_context9.n){case 0:if(encoding===void 0){encoding="utf8"}if(configuration===void 0){configuration=null}if(configurationFilePaths===void 0){configurationFilePaths=[]}filePath=(0,path__WEBPACK_IMPORTED_MODULE_13__.resolve)(pluginPath,relativeFilePaths[0]);_context9.n=1;return (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.isFile)(filePath);case 1:if(_context9.v){_context9.n=15;break}/*
            Determine entry file if given one does not exist: Any JavaScript
            or executable file can serve as api file. Files named "index" or
            "main" are preferred.
        */configurationFileNames=configurationFilePaths.map(function(filePath){return (0,path__WEBPACK_IMPORTED_MODULE_13__.basename)(filePath)});_t10=_createForOfIteratorHelper;_context9.n=2;return (0,fs_promises__WEBPACK_IMPORTED_MODULE_12__.readdir)(pluginPath);case 2:_iterator0=_t10(_context9.v.sort());_context9.p=3;_iterator0.s();case 4:if((_step0=_iterator0.n()).done){_context9.n=12;break}fileName=_step0.value;candidate=(0,path__WEBPACK_IMPORTED_MODULE_13__.resolve)(pluginPath,fileName);_t12=configurationFileNames.includes(fileName);if(_t12){_context9.n=6;break}_context9.n=5;return (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.isFile)(candidate);case 5:_t12=!_context9.v;case 6:_t11=_t12;if(_t11){_context9.n=9;break}_t13=fileName.endsWith(".js");if(_t13){_context9.n=8;break}_context9.n=7;return isExecutable(candidate);case 7:_t13=_context9.v;case 8:_t11=!_t13;case 9:if(!_t11){_context9.n=10;break}return _context9.a(3,11);case 10:filePath=candidate;if(!["index","main"].includes((0,path__WEBPACK_IMPORTED_MODULE_13__.basename)(fileName,(0,path__WEBPACK_IMPORTED_MODULE_13__.extname)(fileName)))){_context9.n=11;break}return _context9.a(3,12);case 11:_context9.n=4;break;case 12:_context9.n=14;break;case 13:_context9.p=13;_t14=_context9.v;_iterator0.e(_t14);case 14:_context9.p=14;_iterator0.f();return _context9.f(14);case 15:api=null;nativeAPI=false;_t15=configuration&&(/*
            NOTE: Check if a webNode plugin configuration is available
            indicating a backend responsibility for api file.

            NOTE: One key is always there representing the whole package
            configuration.
        */Object.keys(configuration).length>1||Object.prototype.hasOwnProperty.call(configuration,internalName)&&Object.keys(configuration[internalName]).length>1);if(!_t15){_context9.n=17;break}_context9.n=16;return (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.isFile)(filePath);case 16:_t15=_context9.v;case 17:if(!_t15){_context9.n=18;break}if(filePath.endsWith(".js")){nativeAPI=true;api=createNativeAPIFactory(plugins,name)}else// NOTE: Any executable file can represent an api.
api=createExecutableAPIFactory(filePath,name,encoding);case 18:pluginConfiguration=configuration!==null&&configuration!==void 0?configuration:_defineProperty({},internalName,{package:{}});hasPluginConfiguration=Object.prototype.hasOwnProperty.call(pluginConfiguration,internalName);if(!plugins[name]){_context9.n=19;break}_t16=plugins[name].scope;_context9.n=23;break;case 19:if(!nativeAPI){_context9.n=21;break}_context9.n=20;return loadFile(filePath,name);case 20:_t17=_context9.v;_context9.n=22;break;case 21:_t17=null;case 22:_t16=_t17;case 23:scope=_t16;_t18=api;if(!api){_context9.n=25;break}_context9.n=24;return (0,fs_promises__WEBPACK_IMPORTED_MODULE_12__.stat)(filePath);case 24:_t20=_context9.v.mtime.getTime();_t19=[_t20];_context9.n=26;break;case 25:_t19=[];case 26:_t21=_t19;_t22=api?[filePath]:[];_t23=pluginConfiguration;_t24=configurationFilePaths;_context9.n=27;return Promise.all(configurationFilePaths.map(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(filePath){return _regenerator().w(function(_context8){while(1)switch(_context8.n){case 0:_context8.n=1;return (0,fs_promises__WEBPACK_IMPORTED_MODULE_12__.stat)(filePath);case 1:return _context8.a(2,_context8.v.mtime.getTime())}},_callee8)}))));case 27:_t25=_context9.v;_t26=hasPluginConfiguration&&pluginConfiguration[internalName].dependencies?pluginConfiguration[internalName].dependencies:[];_t27=internalName;_t28=name;_t29=hasPluginConfiguration?pluginConfiguration[internalName].package:{};_t30=pluginPath;_t31=scope;return _context9.a(2,{api:_t18,apiFileLoadTimestamps:_t21,apiFilePaths:_t22,configuration:_t23,configurationFilePaths:_t24,configurationFileLoadTimestamps:_t25,dependencies:_t26,internalName:_t27,name:_t28,packageConfiguration:_t29,path:_t30,scope:_t31})}},_callee9,null,[[3,13,14,15]])}));function loadAPI(_x14,_x15,_x16,_x17,_x18,_x19,_x20,_x21){return _loadAPI.apply(this,arguments)}return loadAPI}();/**
 * Loads plugin specific configuration object.
 * @param name - Property name where to inject resolved configuration into
 * global one.
 * @param packageConfiguration - Plugin specific package configuration object.
 * @param configurationPropertyNames - Property names to search for to use as
 * entry in plugin configuration file.
 * @returns Determined configuration object.
 */var loadConfiguration=function loadConfiguration(name,packageConfiguration,configurationPropertyNames){/*
        No plugin specific configuration found. Only provide package
        configuration.
        Removing comments (default key prefix to delete is "#").
    */var packageConfigurationCopy=(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.removeKeyPrefixes)((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.copy)(packageConfiguration));var result=_defineProperty({},name,{package:packageConfigurationCopy});var _iterator1=_createForOfIteratorHelper(configurationPropertyNames),_step1;try{for(_iterator1.s();!(_step1=_iterator1.n()).done;){var propertyName=_step1.value;if(packageConfiguration[propertyName]){(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.extend)(true,result,packageConfiguration[propertyName]);/*
                NOTE: We should break the cycle here to avoid endless loops
                when traversing this data structure.
            */delete result[name].package[propertyName];break}}}catch(err){_iterator1.e(err)}finally{_iterator1.f()}return result};/**
 * Loads given plugin configurations into global configuration.
 * @param plugins - Topological sorted list of plugins to check for
 * configurations.
 * @param configuration - Global configuration to extend with.
 * @returns Updated given configuration object.
 */var loadConfigurations=function loadConfigurations(plugins,configuration){/*
        First clear current configuration content key by key to let old top
        level configuration object instance untouched.
    */for(var _i5=0,_Object$keys=Object.keys(configuration);_i5<_Object$keys.length;_i5++){var key=_Object$keys[_i5];delete configuration[key]};(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.extend)(configuration,(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.copy)(_configurator_js__WEBPACK_IMPORTED_MODULE_14__/* ["default"] */ .A));var _iterator10=_createForOfIteratorHelper(plugins),_step10;try{for(_iterator10.s();!(_step10=_iterator10.n()).done;){var plugin=_step10.value;if(Object.prototype.hasOwnProperty.call(plugin,"configuration")){var pluginConfiguration=(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.copy)(plugin.configuration);(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.extend)(true,(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.modifyObject)(configuration,pluginConfiguration),/*
                    NOTE: Should be resolved via preceding
                    "object.modifyObject" call.
                */pluginConfiguration);/*
                NOTE: We apply provided runtime configuration after each plugin
                specific configuration set to give runtime configuration always
                the highest priority when resolving intermediate configuration
                states.
            */if(configuration.core.runtimeConfiguration)(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.extend)(true,configuration,configuration.core.runtimeConfiguration)}}// NOTE: Remove comments (keys like "#" or "#1").
}catch(err){_iterator10.e(err)}finally{_iterator10.f()};(0,clientnode__WEBPACK_IMPORTED_MODULE_10__.removeKeyPrefixes)(configuration);return evaluateConfiguration(configuration)};/**
 * Gathers all existing configuration file paths for given plugin path and
 * file names.
 * @param pluginPath - Path to the plugin directory.
 * @param fileNames - List of configuration file names to check.
 * @returns A list of existing configuration file paths.
 */var gatherConfigurationFilePaths=/*#__PURE__*/function(){var _gatherConfigurationFilePaths=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(pluginPath,fileNames){var result,_iterator11,_step11,fileName,filePath,_t32;return _regenerator().w(function(_context0){while(1)switch(_context0.p=_context0.n){case 0:result=[];_iterator11=_createForOfIteratorHelper(fileNames);_context0.p=1;_iterator11.s();case 2:if((_step11=_iterator11.n()).done){_context0.n=5;break}fileName=_step11.value;filePath=(0,path__WEBPACK_IMPORTED_MODULE_13__.resolve)(pluginPath,fileName);_context0.n=3;return (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.isFile)(filePath);case 3:if(!_context0.v){_context0.n=4;break}result.push(filePath);case 4:_context0.n=2;break;case 5:_context0.n=7;break;case 6:_context0.p=6;_t32=_context0.v;_iterator11.e(_t32);case 7:_context0.p=7;_iterator11.f();return _context0.f(7);case 8:return _context0.a(2,result.sort())}},_callee0,null,[[1,6,7,8]])}));function gatherConfigurationFilePaths(_x23,_x24){return _gatherConfigurationFilePaths.apply(this,arguments)}return gatherConfigurationFilePaths}();/**
 * Load given api file path and returns exported scope.
 * @param filePath - Path to file to load.
 * @param name - Plugin name to use for proper error messages.
 * @param fallbackScope - Scope to return if an error occurs during loading.
 * If a "null" is given an error will be thrown.
 * @param doLogging - Enables logging.
 * @returns Exported api file scope.
 */var loadFile=/*#__PURE__*/function(){var _loadFile=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(filePath,name,fallbackScope,doLogging){var options,scope,_t33;return _regenerator().w(function(_context1){while(1)switch(_context1.p=_context1.n){case 0:if(fallbackScope===void 0){fallbackScope=null}if(doLogging===void 0){doLogging=true}options={};if((0,path__WEBPACK_IMPORTED_MODULE_13__.extname)(filePath)===".json")options.with={type:"json"};_context1.p=1;_context1.n=2;return import(/* webpackIgnore: true */"".concat(filePath,"?timestamp=").concat(String(Date.now())),options);case 2:scope=_context1.v;_context1.n=5;break;case 3:_context1.p=3;_t33=_context1.v;if(!fallbackScope){_context1.n=4;break}scope=fallbackScope;if(doLogging)void log.warn("Couldn't load new api plugin file \"".concat(filePath,"\" for"),"plugin \"".concat(name,"\": ").concat((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.represent)(_t33),". Using"),"fallback one.");_context1.n=5;break;case 4:throw new Error("Couldn't load plugin file \"".concat(filePath,"\" for plugin ")+"\"".concat(name,"\": ").concat((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.represent)(_t33)),{cause:_t33});case 5:if(!(Object.prototype.hasOwnProperty.call(scope,"default")&&scope.default)){_context1.n=6;break}return _context1.a(2,scope.default);case 6:return _context1.a(2,scope)}},_callee1,null,[[1,3]])}));function loadFile(_x25,_x26,_x27,_x28){return _loadFile.apply(this,arguments)}return loadFile}();/**
 * Extends given configuration object with all plugin specific ones and returns
 * a topological sorted list of plugins with plugins specific meta information
 * stored.
 * @param configuration - Configuration object to extend and use.
 * @returns A topological sorted list of plugins objects.
 */var loadAll=/*#__PURE__*/function(){var _loadAll=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(configuration){var plugins,_i6,_Object$entries5,_Object$entries5$_i,name,plugin,pluginConfigurations,_combinePluginConfigu3,internalName,pluginConfiguration,hasPluginConfiguration,_configuration$core$p,_configuration$_inter,_configuration,_name2,_internalName,pluginName,_i7,_Object$values,directory,_directory$nameRegula,compiledRegularExpression,_iterator12,_step12,_pluginName,currentPluginPath,_internalName2,temporaryPlugins,_i8,_Object$values2,_plugin,_iterator13,_step13,_name3,sortedPlugins,_iterator14,_step14,_pluginName2,_i9,_Object$entries6,_Object$entries6$_i,_name4,_plugin2,_t34,_t35,_t36;return _regenerator().w(function(_context10){while(1)switch(_context10.p=_context10.n){case 0:plugins={};for(_i6=0,_Object$entries5=Object.entries(PLUGIN_PRELOADER);_i6<_Object$entries5.length;_i6++){_Object$entries5$_i=_slicedToArray(_Object$entries5[_i6],2),name=_Object$entries5$_i[0],plugin=_Object$entries5$_i[1];pluginConfigurations=[].concat(plugin.configurations||[]);_combinePluginConfigu3=combinePluginConfigurations(plugin.name||name,pluginConfigurations,configuration.core.plugin.configuration.propertyNames),internalName=_combinePluginConfigu3.name,pluginConfiguration=_combinePluginConfigu3.configuration;hasPluginConfiguration=Object.prototype.hasOwnProperty.call(pluginConfiguration,internalName);plugins[name]={api:createNativeAPIFactory(plugins,name),apiFileLoadTimestamps:plugin.scope?[0]:[],apiFilePaths:plugin.scope?[""]:[],configuration:pluginConfiguration,configurationFilePaths:pluginConfigurations.map(function(){return""}),configurationFileLoadTimestamps:pluginConfigurations.map(function(){return 0}),dependencies:hasPluginConfiguration&&pluginConfiguration[internalName].dependencies?pluginConfiguration[internalName].dependencies:[],internalName:internalName,name:name,packageConfiguration:hasPluginConfiguration?pluginConfiguration[internalName].package:{},path:"",scope:plugin.scope||{}}}/*
        Load main plugin configuration at first.

        NOTE: If application's main is this itself avoid loading it twice.
    */if(!(configuration.name!=="web-node")){_context10.n=2;break}_configuration=configuration,_name2=_configuration.name;_internalName=determineInternalName(_name2,new RegExp((_configuration$core$p=configuration.core.plugin.directories.external.nameRegularExpressionPattern)!==null&&_configuration$core$p!==void 0?_configuration$core$p:configuration.core.plugin.nameRegularExpressionPattern));pluginName=((_configuration$_inter=configuration[_internalName])===null||_configuration$_inter===void 0?void 0:_configuration$_inter.package.name)||_name2;_context10.n=1;return load(pluginName,_internalName,plugins,configuration.core.plugin.configuration,configuration.core.context.path,configuration.core.encoding);case 1:plugins[pluginName]=_context10.v;case 2:_i7=0,_Object$values=Object.values(configuration.core.plugin.directories);case 3:if(!(_i7<_Object$values.length)){_context10.n=17;break}directory=_Object$values[_i7];_context10.n=4;return (0,clientnode__WEBPACK_IMPORTED_MODULE_10__.isDirectory)(directory.path);case 4:if(!_context10.v){_context10.n=16;break}compiledRegularExpression=new RegExp((_directory$nameRegula=directory.nameRegularExpressionPattern)!==null&&_directory$nameRegula!==void 0?_directory$nameRegula:configuration.core.plugin.nameRegularExpressionPattern);_t34=_createForOfIteratorHelper;_context10.n=5;return (0,fs_promises__WEBPACK_IMPORTED_MODULE_12__.readdir)(directory.path);case 5:_iterator12=_t34(_context10.v);_context10.p=6;_iterator12.s();case 7:if((_step12=_iterator12.n()).done){_context10.n=13;break}_pluginName=_step12.value;if(compiledRegularExpression.test(_pluginName)){_context10.n=8;break}return _context10.a(3,12);case 8:currentPluginPath=(0,path__WEBPACK_IMPORTED_MODULE_13__.resolve)(directory.path,_pluginName);if(!Object.prototype.hasOwnProperty.call(plugins,_pluginName)){_context10.n=10;break}plugins[_pluginName].path=currentPluginPath;_context10.n=9;return gatherConfigurationFilePaths(currentPluginPath,configuration.core.plugin.configuration.fileNames);case 9:plugins[_pluginName].configurationFilePaths=_context10.v;return _context10.a(3,12);case 10:_internalName2=determineInternalName(_pluginName,compiledRegularExpression);_context10.n=11;return load(_pluginName,_internalName2,plugins,configuration.core.plugin.configuration,currentPluginPath,configuration.core.encoding);case 11:plugins[_pluginName]=_context10.v;case 12:_context10.n=7;break;case 13:_context10.n=15;break;case 14:_context10.p=14;_t35=_context10.v;_iterator12.e(_t35);case 15:_context10.p=15;_iterator12.f();return _context10.f(15);case 16:_i7++;_context10.n=3;break;case 17:temporaryPlugins={};for(_i8=0,_Object$values2=Object.values(plugins);_i8<_Object$values2.length;_i8++){_plugin=_Object$values2[_i8];temporaryPlugins[_plugin.internalName]=_plugin.dependencies;if(Object.prototype.hasOwnProperty.call(configuration.core.interDependencies,_plugin.internalName)){_iterator13=_createForOfIteratorHelper([].concat(configuration.core.interDependencies[_plugin.internalName]));try{for(_iterator13.s();!(_step13=_iterator13.n()).done;){_name3=_step13.value;if(!temporaryPlugins[_plugin.internalName].includes(_name3))temporaryPlugins[_plugin.internalName].push(_name3)}}catch(err){_iterator13.e(err)}finally{_iterator13.f()}}}sortedPlugins=[];_iterator14=_createForOfIteratorHelper((0,clientnode__WEBPACK_IMPORTED_MODULE_10__.sortTopological)(temporaryPlugins));_context10.p=18;_iterator14.s();case 19:if((_step14=_iterator14.n()).done){_context10.n=23;break}_pluginName2=_step14.value;_i9=0,_Object$entries6=Object.entries(plugins);case 20:if(!(_i9<_Object$entries6.length)){_context10.n=22;break}_Object$entries6$_i=_slicedToArray(_Object$entries6[_i9],2),_name4=_Object$entries6$_i[0],_plugin2=_Object$entries6$_i[1];if(![_plugin2.internalName,_name4].includes(_pluginName2)){_context10.n=21;break}sortedPlugins.push(_plugin2);return _context10.a(3,22);case 21:_i9++;_context10.n=20;break;case 22:_context10.n=19;break;case 23:_context10.n=25;break;case 24:_context10.p=24;_t36=_context10.v;_iterator14.e(_t36);case 25:_context10.p=25;_iterator14.f();return _context10.f(25);case 26:_context10.n=27;return loadConfigurations(sortedPlugins,configuration);case 27:configuration=_context10.v;return _context10.a(2,{configuration:configuration,plugins:sortedPlugins})}},_callee10,null,[[18,24,25,26],[6,14,15,16]])}));function loadAll(_x29){return _loadAll.apply(this,arguments)}return loadAll}();/**
 * Transform a list of absolute paths respecting the application context.
 * @param configuration - Configuration object.
 * @param configuration.core - Sub configuration web-node.
 * @param configuration.core.context - Sub web-node context configurations.
 * @param configuration.core.context.path - Current web-nodes path.
 * @param locations - Locations to process.
 * @returns Given and processed locations.
 */var determineLocations=function determineLocations(_ref6,locations){var contextPath=_ref6.core.context.path;if(locations===void 0){locations=[]}locations=[].concat(locations);return locations.length?locations.map(function(location){return (0,path__WEBPACK_IMPORTED_MODULE_13__.resolve)(contextPath,location)}):[contextPath]};/**
 * Checks whether given file path is in provided locations.
 * @param configuration - Configuration object.
 * @param plugins - List of active plugins.
 * @param filePath - Path to search for.
 * @param locations - Locations to search in.
 * @returns A boolean indicating whether given file path is in provided
 * locations.
 */var isInLocations=function isInLocations(configuration,plugins,filePath,locations){var pluginPaths=plugins.map(function(plugin){return plugin.path});var _iterator15=_createForOfIteratorHelper([].concat(locations)),_step15;try{for(_iterator15.s();!(_step15=_iterator15.n()).done;){var location=_step15.value;if(location.startsWith("/")){if(filePath.startsWith((0,path__WEBPACK_IMPORTED_MODULE_13__.join)(configuration.core.context.path,location)))return true}else{var _iterator16=_createForOfIteratorHelper(pluginPaths),_step16;try{for(_iterator16.s();!(_step16=_iterator16.n()).done;){var pluginPath=_step16.value;if(filePath.startsWith((0,path__WEBPACK_IMPORTED_MODULE_13__.resolve)(pluginPath,location)))return true}}catch(err){_iterator16.e(err)}finally{_iterator16.f()}}}}catch(err){_iterator15.e(err)}finally{_iterator15.f()}return false};var pluginAPI={callStack:_callStack,callStackSynchronous:callStackSynchronous,determineInternalName:determineInternalName,determineLocations:determineLocations,evaluateConfiguration:evaluateConfiguration,hotReloadAPIFile:hotReloadAPIFile,hotReloadConfigurationFile:hotReloadConfigurationFile,hotReloadFiles:hotReloadFiles,isInLocations:isInLocations,load:load,loadAll:loadAll,loadAPI:loadAPI,loadConfiguration:loadConfiguration,loadConfigurations:loadConfigurations,loadFile:loadFile};/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pluginAPI);
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),
/* 1 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 5 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({ ["CLOSE_EVENT_NAMES"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.CLOSE_EVENT_NAMES), ["Logger"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.Logger), ["MAXIMAL_NUMBER_OF_ITERATIONS"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.MAXIMAL_NUMBER_OF_ITERATIONS), ["UTILITY_SCOPE"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.UTILITY_SCOPE), ["capitalize"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.capitalize), ["copy"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.copy), ["delimitedToCamelCase"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.delimitedToCamelCase), ["evaluateAsyncDynamicData"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.evaluateAsyncDynamicData), ["evaluateDynamicData"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.evaluateDynamicData), ["extend"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.extend), ["getUTCTimestamp"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.getUTCTimestamp), ["importFilesystemAPI"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.importFilesystemAPI), ["isDirectory"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.isDirectory), ["isFile"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.isFile), ["isFunction"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.isFunction), ["isObject"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.isObject), ["isPlainObject"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.isPlainObject), ["modifyObject"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.modifyObject), ["parseEncodedObject"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.parseEncodedObject), ["removeKeyPrefixes"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.removeKeyPrefixes), ["removeKeysInEvaluation"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.removeKeysInEvaluation), ["represent"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.represent), ["sortTopological"]: () => (__WEBPACK_EXTERNAL_MODULE_clientnode__.sortTopological) });

/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({ ["fileURLToPath"]: () => (__WEBPACK_EXTERNAL_MODULE_node_url_50af3bb5__.fileURLToPath) });

/***/ }),
/* 7 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   H: () => (/* binding */ __webpack_live_configuration__)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var core_js_modules_es_iterator_constructor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var core_js_modules_es_iterator_filter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var core_js_modules_es_iterator_for_each_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);
/* harmony import */ var clientnode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9);
/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(10);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(11);
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(13);
/* harmony import */ var _pluginAPI_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(0);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_pluginAPI_js__WEBPACK_IMPORTED_MODULE_9__]);
var __webpack_async_dependencies_result__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
_pluginAPI_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_async_dependencies_result__[0];
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 4.0 international license.
    See https://creativecommons.org/licenses/by/4.0/deed.de
    endregion
*/// region imports
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}var _mainPackageConfigura,_mainPackageConfigura2,_mainPackageConfigura3,_configuration$core$p;function _createForOfIteratorHelper(e,t){var _n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!_n){if(Array.isArray(e)||(_n=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){_n&&(e=_n);var o=0,F=function F(){};return{s:F,n:function n(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function e(r){throw r},f:F}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,u,i=!0;return{s:function s(){_n=_n.call(e)},n:function n(){i=!0;var r=_n.next();return r.done?{done:!0}:{value:r.value,done:i=!1}},e:function e(r){a=!0,u=r},f:function f(){try{i||null==_n.return||_n.return()}finally{if(a)throw u}}}}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var o={}.toString.call(t).slice(8,-1);return"Object"===o&&t.constructor&&(o=t.constructor.name),"Map"===o||"Set"===o?Array.from(t):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?_arrayLikeToArray(t,e):void 0}}function _arrayLikeToArray(r,a){(null==a||a>r.length)&&(a=r.length);for(var e=0,n=Array(a);e<a;e++)n[e]=r[e];return n}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(o),!0).forEach(function(t){_defineProperty(r,t,o[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):ownKeys(Object(o)).forEach(function(e){Object.defineProperty(r,e,Object.getOwnPropertyDescriptor(o,e))})}return r}function _defineProperty(r,t,o){return(t=_toPropertyKey(t))in r?Object.defineProperty(r,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):r[t]=o,r}function _toPropertyKey(r){var o=_toPrimitive(r,"string");return"symbol"==_typeof(o)?o:o+""}function _toPrimitive(t,e){if("object"!=_typeof(t)||!t)return t;var r;if("undefined"!=typeof Symbol&&void 0!==(r=t[Symbol.toPrimitive])){var i=r.call(t,e||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)};// endregion
/*
    NOTE: This module is bundled into the "dist/" folder so the package root
    is one level up.
*/var webNodePath=(0,path__WEBPACK_IMPORTED_MODULE_7__.resolve)(__webpack_dirname__,"..");/*
    To assume to go two folder up from the package root until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context={path:webNodePath,type:"relative"};for(var iteration=0;iteration<clientnode__WEBPACK_IMPORTED_MODULE_4__.MAXIMAL_NUMBER_OF_ITERATIONS.value;iteration++){_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path=(0,path__WEBPACK_IMPORTED_MODULE_7__.resolve)(_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path,"../../");if((0,path__WEBPACK_IMPORTED_MODULE_7__.basename)((0,path__WEBPACK_IMPORTED_MODULE_7__.dirname)(_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path))!=="node_modules")break}if(_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path==="/"||(0,path__WEBPACK_IMPORTED_MODULE_7__.basename)((0,path__WEBPACK_IMPORTED_MODULE_7__.dirname)(process.cwd()))==="node_modules"||(0,path__WEBPACK_IMPORTED_MODULE_7__.basename)((0,path__WEBPACK_IMPORTED_MODULE_7__.dirname)(process.cwd()))===".staging"&&(0,path__WEBPACK_IMPORTED_MODULE_7__.basename)((0,path__WEBPACK_IMPORTED_MODULE_7__.dirname)((0,path__WEBPACK_IMPORTED_MODULE_7__.dirname)(process.cwd())))==="node_modules")/*
        NOTE: If we are dealing was a dependent project use current directory
        as context.
    */_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path=process.cwd();else/*
        NOTE: If the current working directory references this file via a
        linked "node_modules" folder using current working directory as context
        is a better assumption than two folders up the hierarchy.
    */try{if((await (0,fs_promises__WEBPACK_IMPORTED_MODULE_6__.lstat)((0,path__WEBPACK_IMPORTED_MODULE_7__.join)(process.cwd(),"node_modules"))).isSymbolicLink())_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path=process.cwd()}catch(_unused){// Ignore error.
}var mainPackageConfiguration={name:"main"};try{mainPackageConfiguration=(await import(/* webpackIgnore: true */(0,path__WEBPACK_IMPORTED_MODULE_7__.join)(_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path,"package.json"),{with:{type:"json"}})).default}catch(_unused2){_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.context.path=process.cwd()}var configName=mainPackageConfiguration.webNodeInternalName;var name=configName&&((_mainPackageConfigura=mainPackageConfiguration.webNode)===null||_mainPackageConfigura===void 0||(_mainPackageConfigura=_mainPackageConfigura[configName])===null||_mainPackageConfigura===void 0?void 0:_mainPackageConfigura.name)||configName||((_mainPackageConfigura2=mainPackageConfiguration.webDocumentation)===null||_mainPackageConfigura2===void 0?void 0:_mainPackageConfigura2.name)||mainPackageConfiguration.name||"main";var applicationConfiguration=(_mainPackageConfigura3=mainPackageConfiguration.webNode)!==null&&_mainPackageConfigura3!==void 0?_mainPackageConfigura3:_defineProperty({},name,{name:name});// endregion
_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode.core.name=_package_json__WEBPACK_IMPORTED_MODULE_8__.name;var now=new Date;var scope=_objectSpread(_objectSpread({},clientnode__WEBPACK_IMPORTED_MODULE_4__.UTILITY_SCOPE),{},{currentPath:process.cwd(),fs:fs_promises__WEBPACK_IMPORTED_MODULE_6__["default"],path:path__WEBPACK_IMPORTED_MODULE_7__["default"],pluginAPI:_pluginAPI_js__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Ay,webNodePath:webNodePath,now:now,nowUTCTimestamp:(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.getUTCTimestamp)(now)});__webpack_live_configuration__=await (0,clientnode__WEBPACK_IMPORTED_MODULE_4__.evaluateAsyncDynamicData)((0,clientnode__WEBPACK_IMPORTED_MODULE_4__.evaluateDynamicData)(_package_json__WEBPACK_IMPORTED_MODULE_8__.webNode,{scope:_objectSpread(_objectSpread({},scope),{},{fs:fs__WEBPACK_IMPORTED_MODULE_5__["default"]})}),{scope:scope});delete _package_json__WEBPACK_IMPORTED_MODULE_8__.webNode;(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.extend)(true,(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.modifyObject)(__webpack_live_configuration__,applicationConfiguration),applicationConfiguration);var result={};var _iterator=_createForOfIteratorHelper(process.argv.slice(1)),_step;try{for(_iterator.s();!(_step=_iterator.n()).done;){var argument=_step.value;var subResult=(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.parseEncodedObject)(argument,__webpack_live_configuration__,"configuration");if((0,clientnode__WEBPACK_IMPORTED_MODULE_4__.isPlainObject)(subResult))(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.extend)(true,result,subResult)}}catch(err){_iterator.e(err)}finally{_iterator.f()}if(Object.keys(result).length>0){(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.extend)(true,/*
            NOTE: "object.modifyObject" removes modifications in "result"
            in-place before it is used as extending source.
        */(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.modifyObject)(__webpack_live_configuration__,result),result);__webpack_live_configuration__.core.runtimeConfiguration=result}__webpack_live_configuration__=await (0,clientnode__WEBPACK_IMPORTED_MODULE_4__.evaluateAsyncDynamicData)((0,clientnode__WEBPACK_IMPORTED_MODULE_4__.evaluateDynamicData)(// NOTE: Remove comments (keys like "#" or "#1") as well.
(0,clientnode__WEBPACK_IMPORTED_MODULE_4__.removeKeysInEvaluation)((0,clientnode__WEBPACK_IMPORTED_MODULE_4__.removeKeyPrefixes)(__webpack_live_configuration__)),{scope:_objectSpread(_objectSpread({},scope),{},{fs:fs__WEBPACK_IMPORTED_MODULE_5__["default"]})}),{scope:scope});__webpack_live_configuration__.name=name;__webpack_live_configuration__.core.package=_package_json__WEBPACK_IMPORTED_MODULE_8__;var configurationName=_pluginAPI_js__WEBPACK_IMPORTED_MODULE_9__/* ["default"].determineInternalName */ .Ay.determineInternalName(name,new RegExp((_configuration$core$p=__webpack_live_configuration__.core.plugin.directories.external.nameRegularExpressionPattern)!==null&&_configuration$core$p!==void 0?_configuration$core$p:__webpack_live_configuration__.core.plugin.nameRegularExpressionPattern));__webpack_live_configuration__[configurationName].package=mainPackageConfiguration;/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_live_configuration__);
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),
/* 8 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 9 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({ ["default"]: () => (__WEBPACK_EXTERNAL_MODULE_fs__["default"]) });

/***/ }),
/* 10 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({ ["access"]: () => (__WEBPACK_EXTERNAL_MODULE_fs_promises_cc1b69f3__.access), ["constants"]: () => (__WEBPACK_EXTERNAL_MODULE_fs_promises_cc1b69f3__.constants), ["default"]: () => (__WEBPACK_EXTERNAL_MODULE_fs_promises_cc1b69f3__["default"]), ["lstat"]: () => (__WEBPACK_EXTERNAL_MODULE_fs_promises_cc1b69f3__.lstat), ["readdir"]: () => (__WEBPACK_EXTERNAL_MODULE_fs_promises_cc1b69f3__.readdir), ["stat"]: () => (__WEBPACK_EXTERNAL_MODULE_fs_promises_cc1b69f3__.stat) });

/***/ }),
/* 11 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({ ["basename"]: () => (__WEBPACK_EXTERNAL_MODULE_path__.basename), ["default"]: () => (__WEBPACK_EXTERNAL_MODULE_path__["default"]), ["dirname"]: () => (__WEBPACK_EXTERNAL_MODULE_path__.dirname), ["extname"]: () => (__WEBPACK_EXTERNAL_MODULE_path__.extname), ["join"]: () => (__WEBPACK_EXTERNAL_MODULE_path__.join), ["resolve"]: () => (__WEBPACK_EXTERNAL_MODULE_path__.resolve) });

/***/ }),
/* 12 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ad: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.Ad),
/* harmony export */   GH: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.GH),
/* harmony export */   Gy: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.Gy),
/* harmony export */   HF: () => (/* reexport safe */ _configurator_js__WEBPACK_IMPORTED_MODULE_5__.H),
/* harmony export */   Hh: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.Hh),
/* harmony export */   MM: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.MM),
/* harmony export */   Oy: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.Oy),
/* harmony export */   Rm: () => (/* binding */ log),
/* harmony export */   TV: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.TV),
/* harmony export */   Vx: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.Vx),
/* harmony export */   XK: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.XK),
/* harmony export */   ZN: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.ZN),
/* harmony export */   c0: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.c0),
/* harmony export */   dw: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.dw),
/* harmony export */   e7: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.e7),
/* harmony export */   eQ: () => (/* binding */ isMainModule),
/* harmony export */   gh: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.gh),
/* harmony export */   gl: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.gl),
/* harmony export */   i9: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.i9),
/* harmony export */   iW: () => (/* binding */ main),
/* harmony export */   lT: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.lT),
/* harmony export */   m7: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.m7),
/* harmony export */   nQ: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.nQ),
/* harmony export */   oB: () => (/* binding */ isMainModulePositiveCalls),
/* harmony export */   u2: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.u2),
/* harmony export */   vF: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.vF),
/* harmony export */   zW: () => (/* reexport safe */ _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__.zW)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var core_js_modules_es_iterator_constructor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var core_js_modules_es_iterator_filter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var core_js_modules_es_iterator_for_each_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);
/* harmony import */ var core_js_modules_es_iterator_map_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8);
/* harmony import */ var _configurator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
/* harmony import */ var _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(0);
/* harmony import */ var clientnode__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(5);
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(19);
/* harmony import */ var node_url__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(6);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_configurator_js__WEBPACK_IMPORTED_MODULE_5__, _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__]);
([_configurator_js__WEBPACK_IMPORTED_MODULE_5__, _pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module web-node *//* !
    region header
    [Project page](https://tsickert.com/webNode)

    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 4.0 international license.
    See https://creativecommons.org/licenses/by/4.0/deed.de
    endregion
*/function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function _slicedToArray(e,i){return _iterableToArrayLimit(e,i)||_unsupportedIterableToArray(e,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArrayLimit(r,t){var e=null==r?null:"undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(Array.isArray(r)&&(null==e||e===("undefined"!=typeof Symbol&&[][Symbol.iterator])||e===[]["@@iterator"]))return r;if(null!=e){var l,n,i,a,u=[],o=!0,f=!1;try{if(i=(e=e.call(r)).next,0===t){if(Object(e)!==e)return;o=!1}else for(;!(o=(l=i.call(e)).done)&&(u.push(l.value),u.length!==t);o=!0);}catch(r){f=!0,n=r}finally{try{if(!o&&null!=e.return&&(a=e.return(),Object(a)!==a))return}finally{if(f)throw n}}return u}}function _createForOfIteratorHelper(e,t){var _n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!_n){if(Array.isArray(e)||(_n=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){_n&&(e=_n);var o=0,F=function F(){};return{s:F,n:function n(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function e(r){throw r},f:F}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,u,i=!0;return{s:function s(){_n=_n.call(e)},n:function n(){i=!0;var r=_n.next();return r.done?{done:!0}:{value:r.value,done:i=!1}},e:function e(r){a=!0,u=r},f:function f(){try{i||null==_n.return||_n.return()}finally{if(a)throw u}}}}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var o={}.toString.call(t).slice(8,-1);return"Object"===o&&t.constructor&&(o=t.constructor.name),"Map"===o||"Set"===o?Array.from(t):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?_arrayLikeToArray(t,e):void 0}}function _arrayLikeToArray(r,a){(null==a||a>r.length)&&(a=r.length);for(var e=0,n=Array(a);e<a;e++)n[e]=r[e];return n};function _regenerator(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */var r,e,o="function"==typeof Symbol?Symbol:{},n=o.iterator||"@@iterator",a=o.toStringTag||"@@toStringTag";function i(o,n,a,i){var u=n&&n.prototype instanceof Generator?n:Generator,f=Object.create(u.prototype);return _regeneratorDefine2(f,"_invoke",function(t,o,n){var a,i,u,f=0,p=n||[],y=!1,G={p:0,n:0,v:r,a:l,f:l.bind(r,4),d:function d(t,e){return a=t,i=0,u=r,G.n=e,c}};function l(t,o){for(i=t,u=o,e=0;!y&&f&&!n&&e<p.length;e++){var n,a=p[e],l=G.p,F=a[2];t>3?(n=F===o)&&(u=a[(i=a[4])?5:(i=3,3)],a[4]=a[5]=r):a[0]<=l&&((n=t<2&&l<a[1])?(i=0,G.v=o,G.n=a[1]):l<F&&(n=t<3||a[0]>o||o>F)&&(a[4]=t,a[5]=o,G.n=F,i=0))}if(n||t>1)return c;throw y=!0,o}return function(n,p,F){if(f>1)throw TypeError("Generator is already running");for(y&&1===p&&l(p,F),i=p,u=F;(e=i<2?r:u)||!y;){a||(i?i<3?(i>1&&(G.n=-1),l(i,u)):G.n=u:G.v=u);try{if(f=2,a){if(i||(n="next"),e=a[n]){if(!(e=e.call(a,u)))throw TypeError("iterator result is not an object");if(!e.done)return e;u=e.value,i<2&&(i=0)}else 1===i&&(e=a.return)&&e.call(a),i<2&&(u=TypeError("The iterator does not provide a '"+n+"' method"),i=1);a=r}else if((e=(y=G.n<0)?u:t.call(o,G))!==c)break}catch(t){a=r,i=1,u=t}finally{f=1}}return{value:e,done:y}}}(o,a,i),!0),f}var c={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}e=Object.getPrototypeOf;var u=[][n]?e(e([][n]())):(_regeneratorDefine2(e={},n,function(){return this}),e),f=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(u);function p(r){return Object.setPrototypeOf?Object.setPrototypeOf(r,GeneratorFunctionPrototype):(r.__proto__=GeneratorFunctionPrototype,_regeneratorDefine2(r,a,"GeneratorFunction")),r.prototype=Object.create(f),r}return GeneratorFunction.prototype=GeneratorFunctionPrototype,_regeneratorDefine2(f,"constructor",GeneratorFunctionPrototype),_regeneratorDefine2(GeneratorFunctionPrototype,"constructor",GeneratorFunction),GeneratorFunction.displayName="GeneratorFunction",_regeneratorDefine2(GeneratorFunctionPrototype,a,"GeneratorFunction"),_regeneratorDefine2(f),_regeneratorDefine2(f,a,"Generator"),_regeneratorDefine2(f,n,function(){return this}),_regeneratorDefine2(f,"toString",function(){return"[object Generator]"}),(_regenerator=function _regenerator(){return{w:i,m:p}})()}function _regeneratorDefine2(e,r,n,t){var i=Object.defineProperty;try{i({},"",{})}catch(e){i=0}_regeneratorDefine2=function _regeneratorDefine(e,r,n,t){function o(r,n){_regeneratorDefine2(e,r,function(e){return this._invoke(r,n,e)})}r?i?i(e,r,{value:n,enumerable:!t,configurable:!t,writable:!t}):e[r]=n:(o("next",0),o("throw",1),o("return",2))},_regeneratorDefine2(e,r,n,t)}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(o),!0).forEach(function(t){_defineProperty(r,t,o[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):ownKeys(Object(o)).forEach(function(e){Object.defineProperty(r,e,Object.getOwnPropertyDescriptor(o,e))})}return r}function _defineProperty(r,t,o){return(t=_toPropertyKey(t))in r?Object.defineProperty(r,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):r[t]=o,r}function _toPropertyKey(r){var o=_toPrimitive(r,"string");return"symbol"==_typeof(o)?o:o+""}function _toPrimitive(t,e){if("object"!=_typeof(t)||!t)return t;var r;if("undefined"!=typeof Symbol&&void 0!==(r=t[Symbol.toPrimitive])){var i=r.call(t,e||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}function asyncGeneratorStep(n,t,e,r,o,a,c){try{var i=n[a](c),u=i.value}catch(n){return void e(n)}i.done?t(u):Promise.resolve(u).then(r,o)}function _asyncToGenerator(n){return function(){var t=this,e=arguments;return new Promise(function(r,o){var a=n.apply(t,e);function _next(n){asyncGeneratorStep(a,r,o,_next,_throw,"next",n)}function _throw(n){asyncGeneratorStep(a,r,o,_next,_throw,"throw",n)}_next(void 0)})}}// region imports
;// endregion
var log=new clientnode__WEBPACK_IMPORTED_MODULE_7__.Logger({name:"web-node"});var handleError=/*#__PURE__*/function(){var _handleError=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(state){var _t;return _regenerator().w(function(_context){while(1)switch(_context.p=_context.n){case 0:_context.p=0;_context.n=1;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)(_objectSpread(_objectSpread({},state),{},{hook:"error"}));case 1:_context.n=4;break;case 2:_context.p=2;_t=_context.v;if(!state.configuration.core.debug){_context.n=3;break}throw _t;case 3:void log.error(_t);case 4:return _context.a(2)}},_callee,null,[[0,2]])}));function handleError(_x){return _handleError.apply(this,arguments)}return handleError}();var main=/*#__PURE__*/function(){var _main=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(pluginLoaderMapping){var _yield$loadAll,configuration,plugins,pluginsWithChangedConfiguration,_iterator,_step,type,services,servicePromises,exitTriggered,_i,_Object$keys,name,_iterator2,_step2,plugin,result,_message,_i2,_Object$entries,_Object$entries$_i,_name,promise,finished,closeHandler,_iterator3,_step3,closeEventName,cancelTriggered,_t2,_t3,_t4,_t5,_t6,_t7;return _regenerator().w(function(_context3){while(1)switch(_context3.p=_context3.n){case 0:if(pluginLoaderMapping===void 0){pluginLoaderMapping={}};(0,clientnode__WEBPACK_IMPORTED_MODULE_7__.extend)(_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .PLUGIN_PRELOADER */ .zW,pluginLoaderMapping);// region load plugins
_context3.n=1;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .loadAll */ .gh)((0,clientnode__WEBPACK_IMPORTED_MODULE_7__.copy)(_configurator_js__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A));case 1:_yield$loadAll=_context3.v;configuration=_yield$loadAll.configuration;plugins=_yield$loadAll.plugins;_context3.n=2;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"initialize",plugins:plugins});case 2:if(plugins.length)void log.info("Loaded plugins: \""+plugins.map(function(plugin){return plugin.internalName}).join("\", \"")+"\".");pluginsWithChangedConfiguration=plugins.filter(function(plugin){return Boolean(plugin.configurationFilePaths.length)});_iterator=_createForOfIteratorHelper(["pre","post"]);_context3.p=3;_iterator.s();case 4:if((_step=_iterator.n()).done){_context3.n=6;break}type=_step.value;_context3.n=5;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"".concat(type,"ConfigurationLoaded"),plugins:plugins,pluginsWithChangedConfiguration:pluginsWithChangedConfiguration});case 5:_context3.n=4;break;case 6:_context3.n=8;break;case 7:_context3.p=7;_t2=_context3.v;_iterator.e(_t2);case 8:_context3.p=8;_iterator.f();return _context3.f(8);case 9:// endregion
services={};servicePromises={};exitTriggered=false;_context3.p=10;_context3.n=11;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"preLoadService",plugins:plugins,services:services});case 11:for(_i=0,_Object$keys=Object.keys(services);_i<_Object$keys.length;_i++){name=_Object$keys[_i];void log.info("Service \"".concat(name,"\" initialized."))}_iterator2=_createForOfIteratorHelper(plugins);_context3.p=12;_iterator2.s();case 13:if((_step2=_iterator2.n()).done){_context3.n=20;break}plugin=_step2.value;if(!plugin.api){_context3.n=19;break}_context3.n=14;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"preLoad".concat((0,clientnode__WEBPACK_IMPORTED_MODULE_7__.capitalize)(plugin.internalName),"Service"),plugins:plugins,services:services});case 14:result=null;_context3.p=15;_context3.n=16;return plugin.api({configuration:configuration,hook:"loadService",pluginAPI:_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Ay,plugins:plugins,servicePromises:servicePromises,services:services});case 16:result=_context3.v;_context3.n=18;break;case 17:_context3.p=17;_t3=_context3.v;if(_t3!==null&&_t3!==void 0&&(_message=_t3.message)!==null&&_message!==void 0&&_message.startsWith("NotImplemented:")){_context3.n=18;break}throw new Error("Plugin \"".concat(plugin.internalName,"\" ")+(plugin.internalName===plugin.name?"":"(".concat(plugin.name,") "))+"throws: ".concat((0,clientnode__WEBPACK_IMPORTED_MODULE_7__.represent)(_t3)," 'during asynchrone ")+"hook \"loadService\".",{cause:_t3});case 18:if(result)for(_i2=0,_Object$entries=Object.entries(result);_i2<_Object$entries.length;_i2++){_Object$entries$_i=_slicedToArray(_Object$entries[_i2],2),_name=_Object$entries$_i[0],promise=_Object$entries$_i[1];if((0,clientnode__WEBPACK_IMPORTED_MODULE_7__.isObject)(promise)&&"then"in promise){void log.info("Service \"".concat(_name,"\" started."));servicePromises[_name]=promise}else void log.info("Service \"".concat(_name,"\" loaded."))}_context3.n=19;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"postLoad".concat((0,clientnode__WEBPACK_IMPORTED_MODULE_7__.capitalize)(plugin.internalName),"Service"),plugins:plugins,servicePromises:servicePromises,services:services});case 19:_context3.n=13;break;case 20:_context3.n=22;break;case 21:_context3.p=21;_t4=_context3.v;_iterator2.e(_t4);case 22:_context3.p=22;_iterator2.f();return _context3.f(22);case 23:_context3.n=24;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"postLoadService",plugins:plugins,servicePromises:servicePromises,services:services});case 24:// endregion
// region register close handler
finished=false;closeHandler=function closeHandler(){if(!finished)(0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStackSynchronous */ .gl)({configuration:configuration,data:undefined,hook:"exit",plugins:plugins.slice().reverse(),servicePromises:servicePromises,services:services});finished=true};_iterator3=_createForOfIteratorHelper(clientnode__WEBPACK_IMPORTED_MODULE_7__.CLOSE_EVENT_NAMES);try{for(_iterator3.s();!(_step3=_iterator3.n()).done;){closeEventName=_step3.value;process.on(closeEventName,closeHandler)}}catch(err){_iterator3.e(err)}finally{_iterator3.f()}cancelTriggered=false;/*
            NOTE: "setRawMode" is only available when the input is provided by
            a TTY and not as direct stream from stdin.

            NOTE: Access property via string to avoid lint error
            "@typescript-eslint/unbound-method".
        */// eslint-disable-next-line @typescript-eslint/unbound-method
if((0,clientnode__WEBPACK_IMPORTED_MODULE_7__.isFunction)(process.stdin["setRawMode"]))process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding(configuration.core.encoding);process.stdin.on("data",function(key){void _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(){return _regenerator().w(function(_context2){while(1)switch(_context2.n){case 0:if(!(key==="\x03")){_context2.n=3;break}if(!cancelTriggered){_context2.n=1;break}void log.warn("Stopping ungracefully.");_context2.n=2;break;case 1:cancelTriggered=true;void log.info("You have requested to shut down all services. A","second request will force to stop ungracefully.");_context2.n=2;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"shouldExit",plugins:plugins,servicePromises:servicePromises,services:services});case 2:process.exit();case 3:process.stdout.write(key);case 4:return _context2.a(2)}},_callee2)}))()});// endregion
_context3.p=25;_context3.n=26;return Promise.all(Object.keys(servicePromises).map(function(name){return servicePromises[name]}));case 26:_context3.n=28;break;case 27:_context3.p=27;_t5=_context3.v;case 28:exitTriggered=true;_context3.n=29;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"shouldExit",plugins:plugins,servicePromises:servicePromises,services:services});case 29:process.exit();_context3.n=38;break;case 30:_context3.p=30;_t6=_context3.v;_context3.n=31;return handleError({configuration:configuration,data:_t6,plugins:plugins,servicePromises:servicePromises,services:services});case 31:if(exitTriggered){_context3.n=35;break}_context3.p=32;_context3.n=33;return (0,_pluginAPI_js__WEBPACK_IMPORTED_MODULE_6__/* .callStack */ .lT)({configuration:configuration,data:undefined,hook:"shouldExit",plugins:plugins,servicePromises:servicePromises,services:services});case 33:_context3.n=35;break;case 34:_context3.p=34;_t7=_context3.v;_context3.n=35;return handleError({configuration:configuration,data:_t7,plugins:plugins,servicePromises:servicePromises,services:services});case 35:if(!configuration.core.debug){_context3.n=36;break}throw _t6;case 36:void log.error(_t6);case 37:process.exit(1);case 38:return _context3.a(2)}},_callee3,null,[[32,34],[25,27],[15,17],[12,21,22,23],[10,30],[3,7,8,9]])}));function main(_x2){return _main.apply(this,arguments)}return main}();var isMainModulePositiveCalls={value:0};/*
    NOTE: Neither "import.meta.main" nor "import.meta.url" cannot be used
    directly since bundlers replace them with a compile time constant
    referencing the build environments file location.
*/var isMainModule=/*#__PURE__*/function(){var _isMainModule=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(filename,onlyOnce){var _t8,_t9,_t0;return _regenerator().w(function(_context4){while(1)switch(_context4.p=_context4.n){case 0:if(onlyOnce===void 0){onlyOnce=true}if(!(onlyOnce&&isMainModulePositiveCalls.value>0||process.argv.length<2)){_context4.n=1;break}return _context4.a(2,false);case 1:if(!filename)filename=(0,node_url__WEBPACK_IMPORTED_MODULE_9__.fileURLToPath)(import.meta.url);/*
        NOTE: Both locations have to be resolved since the executable is
        usually linked into a package managers binary folder.
    */_context4.p=2;_context4.n=3;return (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_8__.realpath)(process.argv[1]);case 3:_t8=_context4.v;_context4.n=4;return (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_8__.realpath)(filename);case 4:_t9=_context4.v;if(!(_t8===_t9)){_context4.n=5;break}isMainModulePositiveCalls.value+=1;return _context4.a(2,true);case 5:_context4.n=7;break;case 6:_context4.p=6;_t0=_context4.v;case 7:return _context4.a(2,false)}},_callee4,null,[[2,6]])}));function isMainModule(_x3,_x4){return _isMainModule.apply(this,arguments)}return isMainModule}();/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (main);
/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "Ay", 0, __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"name":"web-node","version":"1.0.640","description":"High level javaScript backend plugin system and configuration merger.","keywords":["api","backend","management","plugin","web"],"homepage":"https://tsickert.com/web-node","bugs":{"email":"info@tsickert.com","url":"https://github.com/thaibault/web-node/issues"},"license":"CC-BY-4.0","author":{"email":"info@tsickert.com","name":"Torben Sickert","url":"https://tsickert.com"},"repository":{"type":"git","url":"git+https://github.com/thaibault/web-node.git"},"type":"module","bin":"dist/main.js","exports":{".":"./dist/index.js","./main":"./dist/main.js","./main.js":"./dist/main.js","./package.json":"./package.json","./unixCrypt":"./dist/unixCrypt.js","./unixCrypt.js":"./dist/unixCrypt.js","./type":"./dist/type.d.ts"},"main":"dist/index.js","typesVersions":{"*":{"type":["./dist/type.d.ts"],"unixCrypt":["./dist/unixCrypt.d.ts"]}},"files":["dist/configurator.d.ts","dist/index.d.ts","dist/index.js","dist/main.js","dist/pluginAPI.d.ts","dist/type.d.ts","dist/unixCrypt.d.ts","dist/unixCrypt.js"],"sideEffects":true,"scripts":{"build":"yarn build:types && yarn build:plain","build:plain":"weboptimizer build","build:types":"weboptimizer build:types","check":"yarn check:types && yarn lint","check:types":"weboptimizer check:types","clear":"weboptimizer clear","document":"weboptimizer document","lint":"weboptimizer lint","prepare":"yarn build","prepare:test":"yarn clear && cd src/test/dummyPlugin && shx touch yarn.lock && yarn install && yarn build && cd ../../..","serve":"yarn build:plain && yarn start","start":"./dist/main.js \'{core: {plugin: {hotReloading: true}}}\'","test":"yarn prepare:test && weboptimizer test","test:coverage":"yarn prepare:test && weboptimizer test:coverage","test:coverage:report":"yarn prepare:test && weboptimizer test:coverage:report","update:documentation":"web-documentation","watch":"weboptimizer build --watch"},"devDependencies":{"@babel/cli":"^8.1.0","@babel/core":"^8.1.0","@babel/eslint-parser":"^8.0.7","@eslint/js":"^10.0.1","@stylistic/eslint-plugin":"^5.10.0","@types/node":"^26.6.6","@types/webpack-env":"^1.18.8","@typescript-eslint/eslint-plugin":"^8.72.1","@typescript-eslint/parser":"^8.72.1","clientnode":"^4.0.1531","core-js":"^3.51.0","eslint":"^10.14.0","eslint-config-google":"^0.14.0","eslint-plugin-jsdoc":"^65.4.5","jest":"^30.5.2","jsdoc":"^4.0.5","shx":"^0.4.0","typescript-eslint":"^8.72.1","web-documentation":"^1.0.74","weboptimizer":"^4.0.115"},"peerDependencies":{"clientnode":"*","core-js":"*"},"resolutions":{"colors":"1.4.0","globals@npm:^11.1.0":"patch:globals@npm%3A11.12.0#~/.yarn/patches/globals-npm-11.12.0-1fa7f41a6c.patch","globals@npm:^14.0.0":"patch:globals@npm%3A11.12.0#~/.yarn/patches/globals-npm-11.12.0-1fa7f41a6c.patch","globals@npm:^9.18.0":"patch:globals@npm%3A11.12.0#~/.yarn/patches/globals-npm-11.12.0-1fa7f41a6c.patch"},"engines":{"node":">=26","npm":">=12","yarn":">=4"},"webNode":{"core":{"context":{"path":"./","type":"relative"},"debug":false,"encoding":"utf8","interDependencies":{},"name":"web-node","plugin":{"configuration":{"fileNames":["package.json","private-package.json"],"propertyNames":["webNode","webnode","web-node"]},"nameRegularExpressionPattern":"^([a-zA-Z0-9-]+?)-?[wW]eb-?[nN]ode-?[pP]lugin$","directories":{"external":{"path":{"__evaluate__":"`${currentPath}/node_modules/`"}},"internal":{"nameRegularExpressionPattern":"^([a-zA-Z0-9-_].*)$","path":{"__evaluate__":"`${currentPath}/plugins/`"}}},"hotReloading":false}}},"webDocumentation":{"languages":["enUS","deDE","frFR"]},"webOptimizer":{"assetPattern":{"javaScript":{"includeFilePathRegularExpression":"^(.+/)?main\\\\.js$","pattern":{"#":"This is how we can make our main exported artifact executable.","__evaluate__":"`#!/usr/bin/env node\\n// -*- coding: utf-8 -*-\\n${self.generic.assetPattern?.javaScript?.pattern ?? \'\'}\\n{1}`"}}},"injection":{"entry":{"__evaluate__":"2 < self.givenCommandLineArguments.length && self.givenCommandLineArguments[2].startsWith(\'test\') ? {testBundle: \'test\'} : {index: \'./index.ts\', main: \'./main.ts\', unixCrypt: \'./unixCrypt.ts\'}"}},"module":{"optimizer":{"terser":{"terserOptions":{"compress":{"#":"To provide a logging output we need to exclude this feature.","drop_console":{"__evaluate__":"false"},"drop_debugger":{"__evaluate__":"false"}}}}}},"path":{"ignore":{"#":"Test fixture plugin which is a yarn project on its own.","__append__":"src/test/dummyPlugin"},"source":{"base":"src/"},"target":{"base":"dist/"},"tidyUpOnClear":{"__append__":{"__evaluate__":"path.resolve(self.path.source.base, \'test/dummyPlugin/index.js\')"}}},"targetTechnology":{"boilerplate":"node","payload":"node"},"webpack":{"module":{"parser":{"javascript":{"importMeta":{"#":"NOTE: This allows as to access node\'s native \\"import.meta.url\\" runtime value for determining the main module.","url":false}}}}}},"packageManager":"yarn@4.18.1+sha512.b2e1e7524f654f2749d32b4ebcb4622473cb5bcbc485df2007e12a154e50162a4d795526768bc5f5b8f81717bfd79deb2472813d86fb5ae2eb551fa9c872b08f"}');

/***/ }),
/* 14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 15 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 16 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 17 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({  });

/***/ }),
/* 18 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({ ["spawnSync"]: () => (__WEBPACK_EXTERNAL_MODULE_child_process__.spawnSync) });

/***/ }),
/* 19 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const x = (y) => {
	const x = {}; __webpack_require__.d(x, y); return x
} 
const y = (x) => (() => (x))
module.exports = x({ ["realpath"]: () => (__WEBPACK_EXTERNAL_MODULE_node_fs_promises_06ebfe74__.realpath) });

/***/ })
/******/ ]);
/************************************************************************/
/******/ // The module cache
/******/ const __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	const cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	const module = __webpack_module_cache__[moduleId] = {
/******/ 		id: moduleId,
/******/ 		loaded: false,
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Flag the module as loaded
/******/ 	module.loaded = true;
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/async module */
/******/ (() => {
/******/ 	const webpackQueues = Symbol("webpack queues");
/******/ 	const webpackExports = Symbol("webpack exports");
/******/ 	const webpackError = Symbol("webpack error");
/******/ 	
/******/ 	const resolveQueue = (queue) => {
/******/ 		if(queue?.d < 1) {
/******/ 			queue.d = 1;
/******/ 			queue.forEach((fn) => (fn.r--));
/******/ 			queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 		}
/******/ 	}
/******/ 	const wrapDeps = (deps) => (deps.map((dep) => {
/******/ 		if(dep !== null && typeof dep === "object") {
/******/ 	
/******/ 			if(dep[webpackQueues]) return dep;
/******/ 			if(dep.then) {
/******/ 				const queue = [];
/******/ 				queue.d = 0;
/******/ 				dep.then((r) => {
/******/ 					obj[webpackExports] = r;
/******/ 					resolveQueue(queue);
/******/ 				}, (e) => {
/******/ 					obj[webpackError] = e;
/******/ 					resolveQueue(queue);
/******/ 				});
/******/ 				const obj = {};
/******/ 	
/******/ 				obj[webpackQueues] = (fn) => (fn(queue));
/******/ 				return obj;
/******/ 			}
/******/ 		}
/******/ 		const ret = {};
/******/ 		ret[webpackQueues] = x => {};
/******/ 		ret[webpackExports] = dep;
/******/ 		return ret;
/******/ 	}));
/******/ 	__webpack_require__.a = (module, body, hasAwait) => {
/******/ 		let queue;
/******/ 		hasAwait && ((queue = []).d = -1);
/******/ 		const depQueues = new Set();
/******/ 		const exports = module.exports;
/******/ 		let currentDeps;
/******/ 		let outerResolve;
/******/ 		let reject;
/******/ 		const promise = new Promise((resolve, rej) => {
/******/ 			reject = rej;
/******/ 			outerResolve = resolve;
/******/ 		});
/******/ 		promise[webpackExports] = exports;
/******/ 		promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 		module.exports = promise;
/******/ 		const handle = (deps) => {
/******/ 			currentDeps = wrapDeps(deps);
/******/ 			let fn;
/******/ 			const getResult = () => (currentDeps.map((d) => {
/******/ 	
/******/ 				if(d[webpackError]) throw d[webpackError];
/******/ 				return d[webpackExports];
/******/ 			}))
/******/ 			const promise = new Promise((resolve) => {
/******/ 				fn = () => (resolve(getResult));
/******/ 				fn.r = 0;
/******/ 				const fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 				currentDeps.forEach((dep) => (dep[webpackQueues](fnQueue)));
/******/ 			});
/******/ 			return fn.r ? promise : getResult();
/******/ 		}
/******/ 		const done = (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue))
/******/ 	
/******/ 		body(handle, done);
/******/ 		queue?.d < 0 && (queue.d = 0);
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ // define getter/value functions for harmony exports
/******/ __webpack_require__.d = (exports, definition) => {
/******/ 	if(Array.isArray(definition)) {
/******/ 		var i = 0;
/******/ 		while(i < definition.length) {
/******/ 			var key = definition[i++];
/******/ 			var binding = definition[i++];
/******/ 			var descriptor = binding === 0 ? { enumerable: true, value: definition[i++] } : { enumerable: true, get: binding };
/******/ 			if(!__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, descriptor);
/******/ 		}
/******/ 	} else {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	}
/******/ };
/******/ 
/******/ /* webpack/runtime/harmony module decorator */
/******/ __webpack_require__.hmd = (module) => {
/******/ 	module = Object.create(module);
/******/ 	if (!module.children) module.children = [];
/******/ 	Object.defineProperty(module, 'exports', {
/******/ 		enumerable: true,
/******/ 		set() {
/******/ 			throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 		}
/******/ 	});
/******/ 	return module;
/******/ };
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 
/************************************************************************/
/******/ 
/******/ let __webpack_live_configuration__;
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module used 'module' so it can't be inlined
/******/ let __webpack_exports__ = __webpack_require__(12);
/******/ __webpack_exports__ = await __webpack_exports__;
/******/ const __webpack_exports__PLUGIN_PRELOADER = __webpack_exports__.zW;
/******/ const __webpack_exports__callStack = __webpack_exports__.lT;
/******/ const __webpack_exports__callStackSynchronous = __webpack_exports__.gl;
/******/ const __webpack_exports__combinePluginConfigurations = __webpack_exports__.c0;
/******/ const __webpack_exports__createExecutableAPIFactory = __webpack_exports__.XK;
/******/ const __webpack_exports__createNativeAPIFactory = __webpack_exports__.Oy;
/******/ const __webpack_exports__default = __webpack_exports__.Ay;
/******/ const __webpack_exports__determineInternalName = __webpack_exports__.Gy;
/******/ const __webpack_exports__determineLocations = __webpack_exports__.m7;
/******/ const __webpack_exports__evaluateConfiguration = __webpack_exports__.u2;
/******/ const __webpack_exports__gatherConfigurationFilePaths = __webpack_exports__.e7;
/******/ const __webpack_exports__hotReloadAPIFile = __webpack_exports__.dw;
/******/ const __webpack_exports__hotReloadConfigurationFile = __webpack_exports__.Vx;
/******/ const __webpack_exports__hotReloadFiles = __webpack_exports__.Ad;
/******/ const __webpack_exports__isExecutable = __webpack_exports__.TV;
/******/ const __webpack_exports__isInLocations = __webpack_exports__.GH;
/******/ const __webpack_exports__isMainModule = __webpack_exports__.eQ;
/******/ const __webpack_exports__isMainModulePositiveCalls = __webpack_exports__.oB;
/******/ const __webpack_exports__load = __webpack_exports__.Hh;
/******/ const __webpack_exports__loadAPI = __webpack_exports__.nQ;
/******/ const __webpack_exports__loadAll = __webpack_exports__.gh;
/******/ const __webpack_exports__loadConfiguration = __webpack_exports__.vF;
/******/ const __webpack_exports__loadConfigurations = __webpack_exports__.i9;
/******/ const __webpack_exports__loadFile = __webpack_exports__.ZN;
/******/ const __webpack_exports__log = __webpack_exports__.Rm;
/******/ const __webpack_exports__main = __webpack_exports__.iW;
/******/ const __webpack_exports__pluginAPI = __webpack_exports__.MM;
/******/ export { __webpack_exports__PLUGIN_PRELOADER as PLUGIN_PRELOADER, __webpack_exports__callStack as callStack, __webpack_exports__callStackSynchronous as callStackSynchronous, __webpack_exports__combinePluginConfigurations as combinePluginConfigurations, __webpack_live_configuration__ as configuration, __webpack_exports__createExecutableAPIFactory as createExecutableAPIFactory, __webpack_exports__createNativeAPIFactory as createNativeAPIFactory, __webpack_exports__default as default, __webpack_exports__determineInternalName as determineInternalName, __webpack_exports__determineLocations as determineLocations, __webpack_exports__evaluateConfiguration as evaluateConfiguration, __webpack_exports__gatherConfigurationFilePaths as gatherConfigurationFilePaths, __webpack_exports__hotReloadAPIFile as hotReloadAPIFile, __webpack_exports__hotReloadConfigurationFile as hotReloadConfigurationFile, __webpack_exports__hotReloadFiles as hotReloadFiles, __webpack_exports__isExecutable as isExecutable, __webpack_exports__isInLocations as isInLocations, __webpack_exports__isMainModule as isMainModule, __webpack_exports__isMainModulePositiveCalls as isMainModulePositiveCalls, __webpack_exports__load as load, __webpack_exports__loadAPI as loadAPI, __webpack_exports__loadAll as loadAll, __webpack_exports__loadConfiguration as loadConfiguration, __webpack_exports__loadConfigurations as loadConfigurations, __webpack_exports__loadFile as loadFile, __webpack_exports__log as log, __webpack_exports__main as main, __webpack_exports__pluginAPI as pluginAPI };
/******/ 
