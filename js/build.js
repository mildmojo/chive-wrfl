/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Quagga = __webpack_require__(1);
	var request = __webpack_require__(2);
	var albumCache = {};
	var albumCacheKeys = [];
	var CACHE_MAX_LENGTH = 100;

	if (document.readyState != 'loading'){
	  start();
	} else {
	  document.addEventListener('DOMContentLoaded', start);
	}

	// function start() {
	//   var App = {
	//       _scanner: null,
	//       init: function() {
	//           this.attachListeners();
	//       },
	//       activateScanner: function() {
	//           var scanner = this.configureScanner('.overlay__content'),
	//               onDetected = function (result) {
	//                   document.querySelector('input.isbn').value = result.codeResult.code;
	//                   stop();
	//               }.bind(this),
	//               stop = function() {
	//                   scanner.stop();  // should also clear all event-listeners?
	//                   scanner.removeEventListener('detected', onDetected);
	//                   this.hideOverlay();
	//                   this.attachListeners();
	//               }.bind(this);

	//           this.showOverlay(stop);
	//           scanner.addEventListener('detected', onDetected).start();
	//       },
	//       attachListeners: function() {
	//           var self = this,
	//               button = document.querySelector('.input-field input + button.scan');

	//           button.addEventListener("click", function onClick(e) {
	//               e.preventDefault();
	//               button.removeEventListener("click", onClick);
	//               self.activateScanner();
	//           });
	//       },
	//       showOverlay: function(cancelCb) {
	//           if (!this._overlay) {
	//               var content = document.createElement('div'),
	//                   closeButton = document.createElement('div');

	//               closeButton.appendChild(document.createTextNode('X'));
	//               content.className = 'overlay__content';
	//               closeButton.className = 'overlay__close';
	//               this._overlay = document.createElement('div');
	//               this._overlay.className = 'overlay';
	//               this._overlay.appendChild(content);
	//               content.appendChild(closeButton);
	//               closeButton.addEventListener('click', function closeClick() {
	//                   closeButton.removeEventListener('click', closeClick);
	//                   cancelCb();
	//               });
	//               document.body.appendChild(this._overlay);
	//           } else {
	//               var closeButton = document.querySelector('.overlay__close');
	//               closeButton.addEventListener('click', function closeClick() {
	//                   closeButton.removeEventListener('click', closeClick);
	//                   cancelCb();
	//               });
	//           }
	//           this._overlay.style.display = "block";
	//       },
	//       hideOverlay: function() {
	//           if (this._overlay) {
	//               this._overlay.style.display = "none";
	//           }
	//       },
	//       configureScanner: function(selector) {
	//           if (!this._scanner) {
	//               this._scanner = Quagga
	//                   .decoder({readers: ['ean_reader']})
	//                   .locator({patchSize: 'medium'})
	//                   .fromVideo({
	//                       target: selector,
	//                       constraints: {
	//                           width: 800,
	//                           height: 600,
	//                           facingMode: "environment"
	//                       }
	//                   });
	//           }
	//           return this._scanner;
	//       }
	//   };
	//   App.init();
	// }

	function start() {
	console.log('Starting...');
	  Quagga.init({
	    // name: 'Live',
	    // type: 'LiveStream',
	    // // target: '#cam-preview',
	    // decoder: {
	    //   readers: ['code_128_reader']
	    // }
	    inputStream: {
	        type : "LiveStream",
	        constraints: {
	            width: 640,
	            height: 480,
	            facingMode: "environment"
	        }
	    },
	    locator: {
	        patchSize: "medium",
	        halfSample: false
	    },
	    numOfWorkers: 4,
	    frequency: 5,
	    decoder: {
	        readers : [{
	            format: "upc_reader",
	            config: {}
	        }],
	    },
	    locate: true,
	  }, function(err) {
	    if (err) return alert('Error initializing barcode reader: ' + err);
	    console.log('Initialized, starting...');

	    searchImage1 = document.querySelector('#search1');
	    searchImage2 = document.querySelector('#search2');
	    // search2Form = document.querySelector('#search2Form');
	    // search2FormArtist = document.querySelector('input#artist');
	    // search2FormTitle = document.querySelector('input#title');

	    albumInfo = document.querySelector('h3#album-info');

	    // search1Window = window.open('about:blank', 'search1');
	    // search2Window = window.open('about:blank', 'search2');

	    Quagga.onDetected(function(data) {
	      var barcode = data.codeResult.code;
	      console.log('DETECTED');
	      console.log(barcode);

	      if (barcode in albumCache) {
	        return processResponse(null, albumCache[barcode]);
	      }

	      request
	        .get('/barcode/' + barcode)
	        .end(processResponse);

	      function processResponse(err, response) {
	        if (err) return console.log(err);
	        if (response.statusCode !== 200) return console.log(response.statusText);
	        if (!(barcode in albumCache)) {
	          albumCache[barcode] = response;
	          albumCacheKeys.push(barcode);
	          while (albumCacheKeys.length > CACHE_MAX_LENGTH) {
	            var key = albumCacheKeys.shift();
	            delete albumCache[key];
	          }
	        }
	        if (!response.body) return console.log('Server returned no results');
	        console.log(response.body.artist + ' - ' + response.body.title);
	        urlArtist = encodeURIComponent(response.body.artist);
	        urlTitle = encodeURIComponent(response.body.title);
	        searchImage1.src = '/searchOld.png?artist=' + urlArtist + '&title=' + urlTitle;
	        searchImage2.src = '/searchNew.png?artist=' + urlArtist + '&title=' + urlTitle;
	        // window.open('http://wrfl.fm/search/plays?utf8=%E2%9C%93&play%5Bartist%5D=' + urlArtist + '&play%5Btrack%5D=&play%5Balbum%5D=' + urlTitle + '&commit=Search+Plays', 'search1');
	        albumInfo.innerText = response.body.artist + ' - ' + response.body.title + ' (' + response.body.date + ')';
	        // search1.src = 'http://wrfl.fm/search/plays?utf8=%E2%9C%93&play%5Bartist%5D=' + urlArtist + '&play%5Btrack%5D=&play%5Balbum%5D=' + urlTitle + '&commit=Search+Plays'
	        // search2FormArtist.value = response.body.artist;
	        // search2FormTitle.value = response.body.title;
	        // search2Form.submit();
	      }
	    });

	    Quagga.onProcessed(function(result) {
	        var drawingCtx = Quagga.canvas.ctx.overlay,
	            drawingCanvas = Quagga.canvas.dom.overlay;

	        if (result) {
	            if (result.boxes) {
	                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
	                result.boxes.filter(function (box) {
	                    return box !== result.box;
	                }).forEach(function (box) {
	                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
	                });
	            }

	            if (result.box) {
	                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
	            }

	            if (result.codeResult && result.codeResult.code) {
	                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
	            }
	        }
	    });

	    Quagga.start();
	  });
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t(t.toString())["default"]:"object"==typeof exports?exports.Quagga=t(t.toString())["default"]:e.Quagga=t(t.toString())["default"]}(this,function(e){return function(e){function t(r){if(n[r])return n[r].e;var o=n[r]={e:{},i:r,l:!1};return e[r].call(o.e,o,o.e,t),o.l=!0,o.e}var n={};return t.m=e,t.c=n,t.p="/",t(t.s=158)}([function(e,t,n){"use strict";var r=!0,o={disableLog:function(e){return"boolean"!=typeof e?new Error("Argument type: "+typeof e+". Please use a boolean."):(r=e,e?"adapter.js logging disabled":"adapter.js logging enabled")},log:function(){if("object"==typeof window){if(r)return;"undefined"!=typeof console&&"function"==typeof console.log&&console.log.apply(console,arguments)}},extractVersion:function(e,t,n){var r=e.match(t);return r&&r.length>=n&&parseInt(r[n],10)},detectBrowser:function(){var e={};if(e.browser=null,e.version=null,e.minVersion=null,"undefined"==typeof window||!window.navigator)return e.browser="Not a browser.",e;if(navigator.mozGetUserMedia)e.browser="firefox",e.version=this.extractVersion(navigator.userAgent,/Firefox\/([0-9]+)\./,1),e.minVersion=31;else if(navigator.webkitGetUserMedia)if(window.webkitRTCPeerConnection)e.browser="chrome",e.version=this.extractVersion(navigator.userAgent,/Chrom(e|ium)\/([0-9]+)\./,2),e.minVersion=38;else{if(!navigator.userAgent.match(/Version\/(\d+).(\d+)/))return e.browser="Unsupported webkit-based browser with GUM support but no WebRTC support.",e;e.browser="safari",e.version=this.extractVersion(navigator.userAgent,/AppleWebKit\/([0-9]+)\./,1),e.minVersion=602}else{if(!navigator.mediaDevices||!navigator.userAgent.match(/Edge\/(\d+).(\d+)$/))return e.browser="Not a supported browser.",e;e.browser="edge",e.version=this.extractVersion(navigator.userAgent,/Edge\/(\d+).(\d+)$/,2),e.minVersion=10547}return e.version<e.minVersion&&o.log("Browser: "+e.browser+" Version: "+e.version+" < minimum supported version: "+e.minVersion+"\n some things might not work!"),e}};e.e={log:o.log,disableLog:o.disableLog,browserDetails:o.detectBrowser(),extractVersion:o.extractVersion}},function(e,t,n){(function(e,r){var o=n(106),i={"function":!0,object:!0},a=i[typeof t]&&t&&!t.nodeType?t:void 0,c=i[typeof e]&&e&&!e.nodeType?e:void 0,s=o(a&&c&&"object"==typeof r&&r),u=o(i[typeof self]&&self),d=o(i[typeof window]&&window),f=o(i[typeof this]&&this),l=s||d!==(f&&f.window)&&d||u||f||Function("return this")();e.e=l}).call(t,n(48)(e),function(){return this}())},function(e,t,n){function r(e){var t=typeof e;return!!e&&("object"==t||"function"==t)}e.e=r},function(e,t,n){function r(e,t){e=a.a.bind()(o(),e),c.a.call(this,e,t)}function o(){var e={};return Object.keys(r.CONFIG_KEYS).forEach(function(t){e[t]=r.CONFIG_KEYS[t]["default"]}),e}var i=n(17),a=i&&i.__esModule?function(){return i["default"]}:function(){return i};Object.defineProperty(a,"a",{get:a});var c=n(6),s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},u={CODE_L_START:{value:0},CODE_G_START:{value:10},START_PATTERN:{value:[1,1,1]},STOP_PATTERN:{value:[1,1,1]},MIDDLE_PATTERN:{value:[1,1,1,1,1]},EXTENSION_START_PATTERN:{value:[1,1,2]},CODE_PATTERN:{value:[[3,2,1,1],[2,2,2,1],[2,1,2,2],[1,4,1,1],[1,1,3,2],[1,2,3,1],[1,1,1,4],[1,3,1,2],[1,2,1,3],[3,1,1,2],[1,1,2,3],[1,2,2,2],[2,2,1,2],[1,1,4,1],[2,3,1,1],[1,3,2,1],[4,1,1,1],[2,1,3,1],[3,1,2,1],[2,1,1,3]]},CODE_FREQUENCY:{value:[0,11,13,14,19,25,28,21,22,26]},SINGLE_CODE_ERROR:{value:.7},AVG_CODE_ERROR:{value:.48},FORMAT:{value:"ean_13",writeable:!1}};r.prototype=Object.create(c.a.prototype,u),r.prototype.constructor=r,r.prototype._decodeCode=function(e,t){var n,r,o,i=[0,0,0,0],a=this,c=e,s=!a._row[c],u=0,d={error:Number.MAX_VALUE,code:-1,start:e,end:e};for(t||(t=a.CODE_PATTERN.length),n=c;n<a._row.length;n++)if(a._row[n]^s)i[u]++;else{if(u===i.length-1){for(r=0;t>r;r++)o=a._matchPattern(i,a.CODE_PATTERN[r]),o<d.error&&(d.code=r,d.error=o);return d.end=n,d.error>a.AVG_CODE_ERROR?null:d}u++,i[u]=1,s=!s}return null},r.prototype._findPattern=function(e,t,n,r,o){var i,a,c,s,u=[],d=this,f=0,l={error:Number.MAX_VALUE,code:-1,start:0,end:0};for(t||(t=d._nextSet(d._row)),void 0===n&&(n=!1),void 0===r&&(r=!0),void 0===o&&(o=d.AVG_CODE_ERROR),i=0;i<e.length;i++)u[i]=0;for(i=t;i<d._row.length;i++)if(d._row[i]^n)u[f]++;else{if(f===u.length-1){for(s=0,c=0;c<u.length;c++)s+=u[c];if(a=d._matchPattern(u,e),o>a)return l.error=a,l.start=i-s,l.end=i,l;if(!r)return null;for(c=0;c<u.length-2;c++)u[c]=u[c+2];u[u.length-2]=0,u[u.length-1]=0,f--}else f++;u[f]=1,n=!n}return null},r.prototype._findStart=function(){for(var e,t,n=this,r=n._nextSet(n._row);!t;){if(t=n._findPattern(n.START_PATTERN,r),!t)return null;if(e=t.start-(t.end-t.start),e>=0&&n._matchRange(e,t.start,0))return t;r=t.end,t=null}},r.prototype._verifyTrailingWhitespace=function(e){var t,n=this;return t=e.end+(e.end-e.start),t<n._row.length&&n._matchRange(e.end,t,0)?e:null},r.prototype._findEnd=function(e,t){var n=this,r=n._findPattern(n.STOP_PATTERN,e,t,!1);return null!==r?n._verifyTrailingWhitespace(r):null},r.prototype._calculateFirstDigit=function(e){var t,n=this;for(t=0;t<n.CODE_FREQUENCY.length;t++)if(e===n.CODE_FREQUENCY[t])return t;return null},r.prototype._decodePayload=function(e,t,n){var r,o,i=this,a=0;for(r=0;6>r;r++){if(e=i._decodeCode(e.end),!e)return null;e.code>=i.CODE_G_START?(e.code=e.code-i.CODE_G_START,a|=1<<5-r):a|=0<<5-r,t.push(e.code),n.push(e)}if(o=i._calculateFirstDigit(a),null===o)return null;if(t.unshift(o),e=i._findPattern(i.MIDDLE_PATTERN,e.end,!0,!1),null===e)return null;for(n.push(e),r=0;6>r;r++){if(e=i._decodeCode(e.end,i.CODE_G_START),!e)return null;n.push(e),t.push(e.code)}return e},r.prototype._decode=function(){var e,t,n=this,r=[],o=[],i={};if(e=n._findStart(),!e)return null;if(t={code:e.code,start:e.start,end:e.end},o.push(t),t=n._decodePayload(t,r,o),!t)return null;if(t=n._findEnd(t.end,!1),!t)return null;if(o.push(t),!n._checksum(r))return null;if(this.supplements.length>0){var a=this._decodeExtensions(t.end);if(!a)return null;var c=a.decodedCodes[a.decodedCodes.length-1],u={start:c.start+((c.end-c.start)/2|0),end:c.end};if(!n._verifyTrailingWhitespace(u))return null;i={supplement:a,code:r.join("")+a.code}}return s({code:r.join(""),start:e.start,end:t.end,codeset:"",startInfo:e,decodedCodes:o},i)},r.prototype._decodeExtensions=function(e){var t,n,r=this._nextSet(this._row,e),o=this._findPattern(this.EXTENSION_START_PATTERN,r,!1,!1);if(null===o)return null;for(t=0;t<this.supplements.length;t++)if(n=this.supplements[t].decode(this._row,o.end),null!==n)return{code:n.code,start:r,startInfo:o,end:n.end,codeset:"",decodedCodes:n.decodedCodes};return null},r.prototype._checksum=function(e){var t,n=0;for(t=e.length-2;t>=0;t-=2)n+=e[t];for(n*=3,t=e.length-1;t>=0;t-=2)n+=e[t];return n%10===0},r.CONFIG_KEYS={supplements:{type:"arrayOf(string)","default":[],description:"Allowed extensions to be decoded (2 and/or 5)"}},t.a=r},function(e,t,n){var r=n(12),o=n(1),i=r(o,"Map");e.e=i},function(e,t,n){var r=Array.isArray;e.e=r},function(e,t,n){function r(e,t){return this._row=[],this.config=e||{},this.supplements=t,this}r.prototype._nextUnset=function(e,t){var n;for(void 0===t&&(t=0),n=t;n<e.length;n++)if(!e[n])return n;return e.length},r.prototype._matchPattern=function(e,t,n){var r,o,i,a,c=0,s=0,u=0,d=0;for(n=n||this.SINGLE_CODE_ERROR||1,r=0;r<e.length;r++)u+=e[r],d+=t[r];if(d>u)return Number.MAX_VALUE;for(o=u/d,n*=o,r=0;r<e.length;r++){if(i=e[r],a=t[r]*o,s=Math.abs(i-a)/a,s>n)return Number.MAX_VALUE;c+=s}return c/d},r.prototype._nextSet=function(e,t){var n;for(t=t||0,n=t;n<e.length;n++)if(e[n])return n;return e.length},r.prototype._correctBars=function(e,t,n){for(var r=n.length,o=0;r--;)o=e[n[r]]*(1-(1-t)/2),o>1&&(e[n[r]]=o)},r.prototype._matchTrace=function(e,t){var n,r,o=[],i=this,a=i._nextSet(i._row),c=!i._row[a],s=0,u={error:Number.MAX_VALUE,code:-1,start:0};if(e){for(n=0;n<e.length;n++)o.push(0);for(n=a;n<i._row.length;n++)if(i._row[n]^c)o[s]++;else{if(s===o.length-1)return r=i._matchPattern(o,e),t>r?(u.start=n-a,u.end=n,u.counter=o,u):null;s++,o[s]=1,c=!c}}else for(o.push(0),n=a;n<i._row.length;n++)i._row[n]^c?o[s]++:(s++,o.push(0),o[s]=1,c=!c);return u.start=a,u.end=i._row.length-1,u.counter=o,u},r.prototype.decodePattern=function(e){var t,n=this;return n._row=e,t=n._decode(),null===t?(n._row.reverse(),t=n._decode(),t&&(t.direction=r.DIRECTION.REVERSE,t.start=n._row.length-t.start,t.end=n._row.length-t.end)):t.direction=r.DIRECTION.FORWARD,t&&(t.format=n.FORMAT),t},r.prototype._matchRange=function(e,t,n){var r;for(e=0>e?0:e,r=e;t>r;r++)if(this._row[r]!==n)return!1;return!0},r.prototype._fillCounters=function(e,t,n){var r,o=this,i=0,a=[];for(n="undefined"!=typeof n?n:!0,e="undefined"!=typeof e?e:o._nextUnset(o._row),t=t||o._row.length,a[i]=0,r=e;t>r;r++)o._row[r]^n?a[i]++:(i++,a[i]=1,n=!n);return a},Object.defineProperty(r.prototype,"FORMAT",{value:"unknown",writeable:!1}),r.DIRECTION={FORWARD:1,REVERSE:-1},r.Exception={StartNotFoundException:"Start-Info was not found!",CodeNotFoundException:"Code could not be found!",PatternNotFoundException:"Pattern could not be found!"},r.CONFIG_KEYS={},t.a=r},function(e,t,n){function r(e){var t=new Float32Array(2);return t[0]=e[0],t[1]=e[1],t}e.e=r},function(e,t,n){function r(e){return!!e&&"object"==typeof e}e.e=r},function(e,t,n){t.a={init:function(e,t){for(var n=e.length;n--;)e[n]=t},shuffle:function(e){var t,n,r=e.length-1;for(r;r>=0;r--)t=Math.floor(Math.random()*r),n=e[r],e[r]=e[t],e[t]=n;return e},toPointList:function(e){var t,n,r=[],o=[];for(t=0;t<e.length;t++){for(r=[],n=0;n<e[t].length;n++)r[n]=e[t][n];o[t]="["+r.join(",")+"]"}return"["+o.join(",\r\n")+"]"},threshold:function(e,t,n){var r,o=[];for(r=0;r<e.length;r++)n.apply(e,[e[r]])>=t&&o.push(e[r]);return o},maxIndex:function(e){var t,n=0;for(t=0;t<e.length;t++)e[t]>e[n]&&(n=t);return n},max:function r(e){var t,r=0;for(t=0;t<e.length;t++)e[t]>r&&(r=e[t]);return r},sum:function o(e){for(var t=e.length,o=0;t--;)o+=e[t];return o}}},function(e,t,n){t.a={drawRect:function(e,t,n,r){n.strokeStyle=r.color,n.fillStyle=r.color,n.lineWidth=1,n.beginPath(),n.strokeRect(e.x,e.y,t.x,t.y)},drawPath:function(e,t,n,r){n.strokeStyle=r.color,n.fillStyle=r.color,n.lineWidth=r.lineWidth,n.beginPath(),n.moveTo(e[0][t.x],e[0][t.y]);for(var o=1;o<e.length;o++)n.lineTo(e[o][t.x],e[o][t.y]);n.closePath(),n.stroke()},drawImage:function(e,t,n){var r,o=n.getImageData(0,0,t.x,t.y),i=o.data,a=e.length,c=i.length;if(c/a!==4)return!1;for(;a--;)r=e[a],i[--c]=255,i[--c]=r,i[--c]=r,i[--c]=r;return n.putImageData(o,0,0),!0}}},function(e,t,n){function r(e,t){for(var n=e.length;n--;)if(o(e[n][0],t))return n;return-1}var o=n(15);e.e=r},function(e,t,n){function r(e,t){var n=e[t];return o(n)?n:void 0}var o=n(142);e.e=r},function(e,t,n){function r(e){var t=typeof e;return"number"==t||"boolean"==t||"string"==t&&"__proto__"!=e||null==e}e.e=r},function(e,t,n){var r=n(12),o=r(Object,"create");e.e=o},function(e,t,n){function r(e,t){return e===t||e!==e&&t!==t}e.e=r},function(e,t,n){function r(e){var t=o(e)?s.call(e):"";return t==i||t==a}var o=n(2),i="[object Function]",a="[object GeneratorFunction]",c=Object.prototype,s=c.toString;e.e=r},function(e,t,n){var r=n(101),o=n(115),i=o(function(e,t,n){r(e,t,n)});e.e=i},function(e,t,n){function r(e,t){var n={x:e,y:t,toVec2:function(){return w.clone([this.x,this.y])},toVec3:function(){return C.clone([this.x,this.y,1])},round:function(){return this.x=this.x>0?Math.floor(this.x+.5):Math.floor(this.x-.5),this.y=this.y>0?Math.floor(this.y+.5):Math.floor(this.y-.5),this}};return n}function o(e,t,n){n||(n=e);for(var r=e.data,o=r.length,i=n.data;o--;)i[o]=r[o]<t?1:0}function i(e,t){t||(t=8);for(var n=e.data,r=n.length,o=8-t,i=1<<t,a=new Int32Array(i);r--;)a[n[r]>>o]++;return a}function a(e,t){function n(e,t){var n,r=0;for(n=e;t>=n;n++)r+=a[n];return r}function r(e,t){var n,r=0;for(n=e;t>=n;n++)r+=n*a[n];return r}function o(){var o,c,s,u,d,f,l,p=[0],h=(1<<t)-1;for(a=i(e,t),u=1;h>u;u++)o=n(0,u),c=n(u+1,h),s=o*c,0===s&&(s=1),d=r(0,u)*c,f=r(u+1,h)*o,l=d-f,p[u]=l*l/s;return _.a.maxIndex(p)}t||(t=8);var a,c,s=8-t;return c=o(),c<<s}function c(e,t){var n=a(e);return o(e,n,t),n}function s(e,t,n){function r(e){var t=!1;for(i=0;i<s.length;i++)a=s[i],a.fits(e)&&(a.add(e),t=!0);return t}var o,i,a,c,s=[];for(n||(n="rad"),o=0;o<e.length;o++)c=b.a.createPoint(e[o],o,n),r(c)||s.push(b.a.create(c,t));return s}function u(e,t,n){var r,o,i,a,c=0,s=0,u=[];for(r=0;t>r;r++)u[r]={score:0,item:null};for(r=0;r<e.length;r++)if(o=n.apply(this,[e[r]]),o>s)for(i=u[c],i.score=o,i.item=e[r],s=Number.MAX_VALUE,a=0;t>a;a++)u[a].score<s&&(s=u[a].score,c=a);return u}function d(e,t,n){for(var r,o=0,i=t.x,a=Math.floor(e.length/4),c=t.x/2,s=0,u=t.x;a>i;){for(r=0;c>r;r++)n[s]=Math.floor((.299*e[4*o+0]+.587*e[4*o+1]+.114*e[4*o+2]+(.299*e[4*(o+1)+0]+.587*e[4*(o+1)+1]+.114*e[4*(o+1)+2])+(.299*e[4*i+0]+.587*e[4*i+1]+.114*e[4*i+2])+(.299*e[4*(i+1)+0]+.587*e[4*(i+1)+1]+.114*e[4*(i+1)+2]))/4),s++,o+=2,i+=2;o+=u,i+=u}}function f(e,t,n){var r,o=e.length/4|0,i=n&&n.singleChannel===!0;if(i)for(r=0;o>r;r++)t[r]=e[4*r+0];else for(r=0;o>r;r++)t[r]=Math.floor(.299*e[4*r+0]+.587*e[4*r+1]+.114*e[4*r+2])}function l(e,t){for(var n=e.data,r=e.size.x,o=t.data,i=0,a=r,c=n.length,s=r/2,u=0;c>a;){for(var d=0;s>d;d++)o[u]=Math.floor((n[i]+n[i+1]+n[a]+n[a+1])/4),u++,i+=2,a+=2;i+=r,a+=r}}function p(e,t){var n=e[0],r=e[1],o=e[2],i=o*r,a=i*(1-Math.abs(n/60%2-1)),c=o-i,s=0,u=0,d=0;return t=t||[0,0,0],60>n?(s=i,u=a):120>n?(s=a,u=i):180>n?(u=i,d=a):240>n?(u=a,d=i):300>n?(s=a,d=i):360>n&&(s=i,d=a),t[0]=255*(s+c)|0,t[1]=255*(u+c)|0,t[2]=255*(d+c)|0,t}function h(e){var t,n=[],r=[];for(t=1;t<Math.sqrt(e)+1;t++)e%t===0&&(r.push(t),t!==e/t&&n.unshift(Math.floor(e/t)));return r.concat(n)}function v(e,t){for(var n=0,r=0,o=[];n<e.length&&r<t.length;)e[n]===t[r]?(o.push(e[n]),n++,r++):e[n]>t[r]?r++:n++;return o}function m(e,t){function n(e){for(var t=0,n=e[Math.floor(e.length/2)];t<e.length-1&&e[t]<l;)t++;return t>0&&(n=Math.abs(e[t]-l)>Math.abs(e[t-1]-l)?e[t-1]:e[t]),l/n<s[d+1]/s[d]&&l/n>s[d-1]/s[d]?{x:n,y:n}:null}var r,o=h(t.x),i=h(t.y),a=Math.max(t.x,t.y),c=v(o,i),s=[8,10,15,20,32,60,80],u={"x-small":5,small:4,medium:3,large:2,"x-large":1},d=u[e]||u.medium,f=s[d],l=Math.floor(a/f);return r=n(c),r||(r=n(h(a)),r||(r=n(h(l*f)))),r}function g(e){var t={value:parseFloat(e),unit:(e.indexOf("%")===e.length-1,"%")};return t}function y(e,t,n){var r={width:e,height:t},o=Object.keys(n).reduce(function(e,t){var o=n[t],i=g(o),a=E[t](i,r);return e[t]=a,e},{});return{sx:o.left,sy:o.top,sw:o.right-o.left,sh:o.bottom-o.top}}var b=n(51),_=n(9);t.f=r,t.c=c,t.d=s,t.e=u,t.i=d,t.j=f,t.g=l,t.a=p,t.b=m,t.h=y;var w={clone:n(7)},C={clone:n(80)},E={top:function(e,t){return"%"===e.unit?Math.floor(t.height*(e.value/100)):void 0},right:function(e,t){return"%"===e.unit?Math.floor(t.width-t.width*(e.value/100)):void 0},bottom:function(e,t){return"%"===e.unit?Math.floor(t.height-t.height*(e.value/100)):void 0},left:function(e,t){return"%"===e.unit?Math.floor(t.width*(e.value/100)):void 0}}},function(e,t,n){function r(e,t,n,r){t?this.data=t:n?(this.data=new n(e.x*e.y),n===Array&&r&&a.a.init(this.data,0)):(this.data=new Uint8Array(e.x*e.y),Uint8Array===Array&&r&&a.a.init(this.data,0)),this.size=e}var o=n(53),i=n(18),a=n(9),c={clone:n(7)};r.prototype.inImageWithBorder=function(e,t){return e.x>=t&&e.y>=t&&e.x<this.size.x-t&&e.y<this.size.y-t},r.sample=function(e,t,n){var r=Math.floor(t),o=Math.floor(n),i=e.size.x,a=o*e.size.x+r,c=e.data[a+0],s=e.data[a+1],u=e.data[a+i],d=e.data[a+i+1],f=c-s;t-=r,n-=o;var l=Math.floor(t*(n*(f-u+d)-f)+n*(u-c)+c);return l},r.clearArray=function(e){for(var t=e.length;t--;)e[t]=0},r.prototype.subImage=function(e,t){return new o.a(e,t,this)},r.prototype.subImageAsCopy=function(e,t){var n,r,o=e.size.y,i=e.size.x;for(n=0;i>n;n++)for(r=0;o>r;r++)e.data[r*i+n]=this.data[(t.y+r)*this.size.x+t.x+n]},r.prototype.copyTo=function(e){for(var t=this.data.length,n=this.data,r=e.data;t--;)r[t]=n[t]},r.prototype.get=function(e,t){return this.data[t*this.size.x+e]},r.prototype.getSafe=function(e,t){var n;if(!this.indexMapping){for(this.indexMapping={x:[],y:[]},n=0;n<this.size.x;n++)this.indexMapping.x[n]=n,this.indexMapping.x[n+this.size.x]=n;for(n=0;n<this.size.y;n++)this.indexMapping.y[n]=n,this.indexMapping.y[n+this.size.y]=n}return this.data[this.indexMapping.y[t+this.size.y]*this.size.x+this.indexMapping.x[e+this.size.x]]},r.prototype.set=function(e,t,n){return this.data[t*this.size.x+e]=n,this},r.prototype.zeroBorder=function(){var e,t=this.size.x,n=this.size.y,r=this.data;for(e=0;t>e;e++)r[e]=r[(n-1)*t+e]=0;for(e=1;n-1>e;e++)r[e*t]=r[e*t+(t-1)]=0},r.prototype.invert=function(){for(var e=this.data,t=e.length;t--;)e[t]=e[t]?0:1},r.prototype.convolve=function(e){var t,n,r,o,i=e.length/2|0,a=0;for(n=0;n<this.size.y;n++)for(t=0;t<this.size.x;t++){for(a=0,o=-i;i>=o;o++)for(r=-i;i>=r;r++)a+=e[o+i][r+i]*this.getSafe(t+r,n+o);this.data[n*this.size.x+t]=a}},r.prototype.moments=function(e){var t,n,r,o,i,a,s,u,d,f,l,p,h=this.data,v=this.size.y,m=this.size.x,g=[],y=[],b=Math.PI,_=b/4;if(0>=e)return y;for(i=0;e>i;i++)g[i]={m00:0,m01:0,m10:0,m11:0,m02:0,m20:0,theta:0,rad:0};for(n=0;v>n;n++)for(o=n*n,t=0;m>t;t++)r=h[n*m+t],r>0&&(a=g[r-1],a.m00+=1,a.m01+=n,a.m10+=t,a.m11+=t*n,a.m02+=o,a.m20+=t*t);for(i=0;e>i;i++)a=g[i],isNaN(a.m00)||0===a.m00||(f=a.m10/a.m00,l=a.m01/a.m00,s=a.m11/a.m00-f*l,u=a.m02/a.m00-l*l,d=a.m20/a.m00-f*f,p=(u-d)/(2*s),p=.5*Math.atan(p)+(s>=0?_:-_)+b,a.theta=(180*p/b+90)%180-90,a.theta<0&&(a.theta+=180),a.rad=p>b?p-b:p,a.vec=c.clone([Math.cos(p),Math.sin(p)]),y.push(a));return y},r.prototype.show=function(e,t){var n,r,o,i,a,c,s;for(t||(t=1),n=e.getContext("2d"),e.width=this.size.x,e.height=this.size.y,r=n.getImageData(0,0,e.width,e.height),o=r.data,i=0,s=0;s<this.size.y;s++)for(c=0;c<this.size.x;c++)a=s*this.size.x+c,i=this.get(c,s)*t,o[4*a+0]=i,o[4*a+1]=i,o[4*a+2]=i,o[4*a+3]=255;n.putImageData(r,0,0)},r.prototype.overlay=function(e,t,n){(!t||0>t||t>360)&&(t=360);for(var r=[0,1,1],o=[0,0,0],a=[255,255,255],c=[0,0,0],s=[],u=e.getContext("2d"),d=u.getImageData(n.x,n.y,this.size.x,this.size.y),f=d.data,l=this.data.length;l--;)r[0]=this.data[l]*t,s=r[0]<=0?a:r[0]>=360?c:i.a.bind()(r,o),f[4*l+0]=s[0],f[4*l+1]=s[1],f[4*l+2]=s[2],f[4*l+3]=255;u.putImageData(d,n.x,n.y)},t.a=r},function(e,t,n){function r(e,t,n,r){var o=-1,i=e.length;for(r&&i&&(n=e[++o]);++o<i;)n=t(n,e[o],o,e);return n}e.e=r},function(e,t,n){function r(e,t,n){return o(e,t,n)}var o=n(113);e.e=r},function(e,t,n){function r(e){var t=!1;if(null!=e&&"function"!=typeof e.toString)try{t=!!(e+"")}catch(n){}return t}e.e=r},function(e,t,n){function r(e,t){return e="number"==typeof e||i.test(e)?+e:-1,t=null==t?o:t,e>-1&&e%1==0&&t>e}var o=9007199254740991,i=/^(?:0|[1-9]\d*)$/;e.e=r},function(e,t,n){function r(e){var t=e&&e.constructor,n="function"==typeof t&&t.prototype||o;return e===n}var o=Object.prototype;e.e=r},function(e,t,n){function r(e){return o(e)&&c.call(e,"callee")&&(!u.call(e,"callee")||s.call(e)==i)}var o=n(27),i="[object Arguments]",a=Object.prototype,c=a.hasOwnProperty,s=a.toString,u=a.propertyIsEnumerable;e.e=r},function(e,t,n){function r(e){return null!=e&&a(o(e))&&!i(e)}var o=n(117),i=n(16),a=n(28);e.e=r},function(e,t,n){function r(e){return i(e)&&o(e)}var o=n(26),i=n(8);e.e=r},function(e,t,n){function r(e){return"number"==typeof e&&e>-1&&e%1==0&&o>=e}var o=9007199254740991;e.e=r},function(e,t,n){var r={searchDirections:[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]],create:function(e,t){function n(e,t,n,r){var o,d,f;for(o=0;7>o;o++){if(d=e.cy+s[e.dir][0],f=e.cx+s[e.dir][1],i=d*u+f,a[i]===t&&(0===c[i]||c[i]===n))return c[i]=n,e.cy=d,e.cx=f,!0;0===c[i]&&(c[i]=r),e.dir=(e.dir+1)%8}return!1}function r(e,t,n){return{dir:n,x:e,y:t,next:null,prev:null}}function o(e,t,o,i,a){var c,s,u,d=null,f={cx:t,cy:e,dir:0};if(n(f,i,o,a)){d=r(t,e,f.dir),c=d,u=f.dir,s=r(f.cx,f.cy,0),s.prev=c,c.next=s,s.next=null,c=s;do f.dir=(f.dir+6)%8,n(f,i,o,a),u!==f.dir?(c.dir=f.dir,s=r(f.cx,f.cy,0),s.prev=c,c.next=s,s.next=null,c=s):(c.dir=u,c.x=f.cx,c.y=f.cy),u=f.dir;while(f.cx!==t||f.cy!==e);d.prev=c.prev,c.prev.next=d}return d}var i,a=e.data,c=t.data,s=this.searchDirections,u=e.size.x;return{trace:function(e,t,r,o){return n(e,t,r,o)},contourTracing:function(e,t,n,r,i){return o(e,t,n,r,i)}}}};t.a=r},function(e,t,n){function r(){o.a.call(this)}var o=n(6),i=n(9),a={ALPHABETH_STRING:{value:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. *$/+%"},ALPHABET:{value:[48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,45,46,32,42,36,47,43,37]},CHARACTER_ENCODINGS:{value:[52,289,97,352,49,304,112,37,292,100,265,73,328,25,280,88,13,268,76,28,259,67,322,19,274,82,7,262,70,22,385,193,448,145,400,208,133,388,196,148,168,162,138,42]},ASTERISK:{value:148},FORMAT:{value:"code_39",writeable:!1}};r.prototype=Object.create(o.a.prototype,a),r.prototype.constructor=r,r.prototype._toCounters=function(e,t){var n,r=this,o=t.length,a=r._row.length,c=!r._row[e],s=0;for(i.a.init(t,0),n=e;a>n;n++)if(r._row[n]^c)t[s]++;else{if(s++,s===o)break;t[s]=1,c=!c}return t},r.prototype._decode=function(){var e,t,n,r,o=this,a=[0,0,0,0,0,0,0,0,0],c=[],s=o._findStart();if(!s)return null;r=o._nextSet(o._row,s.end);do{if(a=o._toCounters(r,a),n=o._toPattern(a),0>n)return null;if(e=o._patternToChar(n),0>e)return null;c.push(e),t=r,r+=i.a.sum(a),r=o._nextSet(o._row,r)}while("*"!==e);return c.pop(),c.length&&o._verifyTrailingWhitespace(t,r,a)?{code:c.join(""),start:s.start,end:r,startInfo:s,decodedCodes:c}:null},r.prototype._verifyTrailingWhitespace=function(e,t,n){var r,o=i.a.sum(n);return r=t-e-o,3*r>=o},r.prototype._patternToChar=function(e){var t,n=this;for(t=0;t<n.CHARACTER_ENCODINGS.length;t++)if(n.CHARACTER_ENCODINGS[t]===e)return String.fromCharCode(n.ALPHABET[t]);return-1},r.prototype._findNextWidth=function(e,t){var n,r=Number.MAX_VALUE;for(n=0;n<e.length;n++)e[n]<r&&e[n]>t&&(r=e[n]);return r},r.prototype._toPattern=function(e){for(var t,n,r=e.length,o=0,i=r,a=0,c=this;i>3;){for(o=c._findNextWidth(e,o),i=0,t=0,n=0;r>n;n++)e[n]>o&&(t|=1<<r-1-n,i++,a+=e[n]);if(3===i){for(n=0;r>n&&i>0;n++)if(e[n]>o&&(i--,2*e[n]>=a))return-1;return t}}return-1},r.prototype._findStart=function(){var e,t,n,r=this,o=r._nextSet(r._row),i=o,a=[0,0,0,0,0,0,0,0,0],c=0,s=!1;for(e=o;e<r._row.length;e++)if(r._row[e]^s)a[c]++;else{if(c===a.length-1){if(r._toPattern(a)===r.ASTERISK&&(n=Math.floor(Math.max(0,i-(e-i)/4)),r._matchRange(n,i,0)))return{start:i,end:e};for(i+=a[0]+a[1],t=0;7>t;t++)a[t]=a[t+2];a[7]=0,a[8]=0,c--}else c++;a[c]=1,s=!s}return null},t.a=r},function(e,t,n){function r(e,t){return e[0]*t[0]+e[1]*t[1]}e.e=r},function(e,t,n){function r(e){var t=-1,n=e?e.length:0;for(this.clear();++t<n;){var r=e[t];this.set(r[0],r[1])}}var o=n(135),i=n(136),a=n(137),c=n(138),s=n(139);r.prototype.clear=o,r.prototype["delete"]=i,r.prototype.get=a,r.prototype.has=c,r.prototype.set=s,e.e=r},function(e,t,n){function r(e,t){for(var n=-1,r=e.length;++n<r&&t(e[n],n,e)!==!1;);return e}e.e=r},function(e,t,n){function r(e,t,n){(void 0===n||o(e[t],n))&&("number"!=typeof t||void 0!==n||t in e)||(e[t]=n)}var o=n(15);e.e=r},function(e,t,n){function r(e,t,n){var r=e[t];a.call(e,t)&&o(r,n)&&(void 0!==n||t in e)||(e[t]=n)}var o=n(15),i=Object.prototype,a=i.hasOwnProperty;e.e=r},function(e,t,n){function r(e,t){var n=o(e,t);if(0>n)return!1;var r=e.length-1;return n==r?e.pop():a.call(e,n,1),!0}var o=n(11),i=Array.prototype,a=i.splice;e.e=r},function(e,t,n){function r(e,t){var n=o(e,t);return 0>n?void 0:e[n][1]}var o=n(11);e.e=r},function(e,t,n){function r(e,t){return o(e,t)>-1}var o=n(11);e.e=r},function(e,t,n){function r(e,t,n){var r=o(e,t);0>r?e.push([t,n]):e[r][1]=n}var o=n(11);e.e=r},function(e,t,n){function r(e){var t=new e.constructor(e.byteLength);return new o(t).set(new o(e)),t}var o=n(86);e.e=r},function(e,t,n){function r(e,t){var n=-1,r=e.length;for(t||(t=Array(r));++n<r;)t[n]=e[n];return t}e.e=r},function(e,t,n){function r(e,t){return o?void 0!==e[t]:a.call(e,t)}var o=n(14),i=Object.prototype,a=i.hasOwnProperty;e.e=r},function(e,t,n){function r(e){var t=e?e.length:void 0;return c(t)&&(a(e)||s(e)||i(e))?o(t,String):null}var o=n(105),i=n(25),a=n(5),c=n(28),s=n(144);e.e=r},function(e,t,n){function r(e){return i(e)&&o(e.length)&&!!D[A.call(e)]}var o=n(28),i=n(8),a="[object Arguments]",c="[object Array]",s="[object Boolean]",u="[object Date]",d="[object Error]",f="[object Function]",l="[object Map]",p="[object Number]",h="[object Object]",v="[object RegExp]",m="[object Set]",g="[object String]",y="[object WeakMap]",b="[object ArrayBuffer]",_="[object Float32Array]",w="[object Float64Array]",C="[object Int8Array]",E="[object Int16Array]",T="[object Int32Array]",R="[object Uint8Array]",S="[object Uint8ClampedArray]",O="[object Uint16Array]",x="[object Uint32Array]",D={};D[_]=D[w]=D[C]=D[E]=D[T]=D[R]=D[S]=D[O]=D[x]=!0,D[a]=D[c]=D[b]=D[s]=D[u]=D[d]=D[f]=D[l]=D[p]=D[h]=D[v]=D[m]=D[g]=D[y]=!1;var P=Object.prototype,A=P.toString;e.e=r},function(e,t,n){function r(e){var t=u(e);if(!t&&!c(e))return i(e);var n=a(e),r=!!n,d=n||[],f=d.length;for(var l in e)!o(e,l)||r&&("length"==l||s(l,f))||t&&"constructor"==l||d.push(l);return d}var o=n(98),i=n(99),a=n(43),c=n(26),s=n(23),u=n(24);e.e=r},function(e,t,n){function r(e){for(var t=-1,n=c(e),r=o(e),s=r.length,d=i(e),f=!!d,l=d||[],p=l.length;++t<s;){var h=r[t];f&&("length"==h||a(h,p))||"constructor"==h&&(n||!u.call(e,h))||l.push(h)}return l}var o=n(100),i=n(43),a=n(23),c=n(24),s=Object.prototype,u=s.hasOwnProperty;e.e=r},function(e,t,n){function r(e,t){if("function"!=typeof e)throw new TypeError(a);return t=c(void 0===t?e.length-1:i(t),0),function(){for(var n=arguments,r=-1,i=c(n.length-t,0),a=Array(i);++r<i;)a[r]=n[t+r];switch(t){case 0:return e.call(this,a);case 1:return e.call(this,n[0],a);case 2:return e.call(this,n[0],n[1],a)}var s=Array(t+1);for(r=-1;++r<t;)s[r]=n[r];return s[t]=a,o(e,this,s)}}var o=n(90),i=n(146),a="Expected a function",c=Math.max;e.e=r},function(e,t,n){e.e=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],Object.defineProperty(e,"exports",{enumerable:!0,configurable:!1,get:function(){return e.e},set:function(t){return e.e=t}}),Object.defineProperty(e,"loaded",{enumerable:!0,configurable:!1,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,configurable:!1,get:function(){return e.i}}),e.webpackPolyfill=1),e}},function(t,n,r){function o(e){d(e),L=G.a.create(ee.decoder,k)}function i(e){var t;if("VideoStream"===ee.inputStream.type)t=document.createElement("video"),M=X.a.createVideoStream(t);else if("ImageStream"===ee.inputStream.type)M=X.a.createImageStream();else if("LiveStream"===ee.inputStream.type){var n=a();n&&(t=n.querySelector("video"),t||(t=document.createElement("video"),n.appendChild(t))),M=X.a.createLiveStream(t),W.a.request(t,ee.inputStream.constraints).then(function(){M.trigger("canrecord")})["catch"](function(t){return e(t)})}M.setAttribute("preload","auto"),M.setInputStream(ee.inputStream),M.addEventListener("canrecord",c.bind(void 0,e))}function a(){var e=ee.inputStream.target;if(e&&e.nodeName&&1===e.nodeType)return e;var t="string"==typeof e?e:"#interactive.viewport";return document.querySelector(t)}function c(e){F.a.checkImageConstraints(M,ee.locator),u(ee),j=J.a.create(M,Q.dom.image),R(ee.numOfWorkers,function(){0===ee.numOfWorkers&&o(),s(e)})}function s(e){M.play(),e()}function u(){if("undefined"!=typeof document){var e=a();if(Q.dom.image=document.querySelector("canvas.imgBuffer"),Q.dom.image||(Q.dom.image=document.createElement("canvas"),Q.dom.image.className="imgBuffer",e&&"ImageStream"===ee.inputStream.type&&e.appendChild(Q.dom.image)),Q.ctx.image=Q.dom.image.getContext("2d"),Q.dom.image.width=M.getCanvasSize().x,Q.dom.image.height=M.getCanvasSize().y,Q.dom.overlay=document.querySelector("canvas.drawingBuffer"),!Q.dom.overlay){Q.dom.overlay=document.createElement("canvas"),Q.dom.overlay.className="drawingBuffer",e&&e.appendChild(Q.dom.overlay);var t=document.createElement("br");t.setAttribute("clear","all"),e&&e.appendChild(t)}Q.ctx.overlay=Q.dom.overlay.getContext("2d"),Q.dom.overlay.width=M.getCanvasSize().x,Q.dom.overlay.height=M.getCanvasSize().y}}function d(e){k=e?e:new U.a({x:M.getWidth(),y:M.getHeight()}),N=[$.clone([0,0]),$.clone([0,k.size.y]),$.clone([k.size.x,k.size.y]),$.clone([k.size.x,0])],F.a.init(k,ee.locator)}function f(){return ee.locate?F.a.locate():[[$.clone(N[0]),$.clone(N[1]),$.clone(N[2]),$.clone(N[3])]]}function l(e){function t(e){for(var t=e.length;t--;)e[t][0]+=i,e[t][1]+=a}function n(e){e[0].x+=i,e[0].y+=a,e[1].x+=i,e[1].y+=a}var r,o=M.getTopRight(),i=o.x,a=o.y;if(0!==i||0!==a){if(e.barcodes)for(r=0;r<e.barcodes.length;r++)l(e.barcodes[r]);if(e.line&&2===e.line.length&&n(e.line),e.box&&t(e.box),e.boxes&&e.boxes.length>0)for(r=0;r<e.boxes.length;r++)t(e.boxes[r])}}function p(e,t){t&&z&&(e.barcodes?e.barcodes.filter(function(e){return e.codeResult}).forEach(function(e){return p(e,t)}):e.codeResult&&z.addResult(t,M.getCanvasSize(),e.codeResult))}function h(e){return e&&(e.barcodes?e.barcodes.some(function(e){return e.codeResult}):e.codeResult)}function v(e,t){var n=e;e&&Z&&(l(e),p(e,t),n=e.barcodes||e),B.a.publish("processed",n),h(e)&&B.a.publish("detected",n)}function m(){var e,t;t=f(),t?(e=L.decodeFromBoundingBoxes(t),e=e||{},e.boxes=t,v(e,k.data)):v()}function g(){var e;if(Z){if(K.length>0){if(e=K.filter(function(e){return!e.busy})[0],!e)return;j.attachData(e.imageData)}else j.attachData(k.data);j.grab()&&(e?(e.busy=!0,e.worker.postMessage({cmd:"process",imageData:e.imageData},[e.imageData.buffer])):m())}else m()}function y(){var e=null,t=1e3/(ee.frequency||60);I=!1,function n(r){e=e||r,I||(r>=e&&(e+=t,g()),window.requestAnimFrame(n))}(performance.now())}function b(){Z&&"LiveStream"===ee.inputStream.type?y():g()}function _(e){var t,n={worker:void 0,imageData:new Uint8Array(M.getWidth()*M.getHeight()),busy:!0};t=E(),n.worker=new Worker(t),n.worker.onmessage=function(r){return"initialized"===r.data.event?(URL.revokeObjectURL(t),n.busy=!1,n.imageData=new Uint8Array(r.data.imageData),e(n)):void("processed"===r.data.event?(n.imageData=new Uint8Array(r.data.imageData),n.busy=!1,v(r.data.result,n.imageData)):"error"===r.data.event)},n.worker.postMessage({cmd:"init",size:{x:M.getWidth(),y:M.getHeight()},imageData:n.imageData,config:w(ee)},[n.imageData.buffer])}function w(e){return Y({},e,{inputStream:Y({},e.inputStream,{target:null})})}function C(e){function t(e){self.postMessage({event:"processed",imageData:o.data,result:e},[o.data.buffer])}function n(){self.postMessage({event:"initialized",imageData:o.data},[o.data.buffer])}if(e){var r=e()["default"];if(!r)return void self.postMessage({event:"error",message:"Quagga could not be created"})}var o;self.onmessage=function(e){if("init"===e.data.cmd){var i=e.data.config;i.numOfWorkers=0,o=new r.ImageWrapper({x:e.data.size.x,y:e.data.size.y},new Uint8Array(e.data.imageData)),r.init(i,n,o),r.onProcessed(t)}else"process"===e.data.cmd?(o.data=new Uint8Array(e.data.imageData),r.start()):"setReaders"===e.data.cmd&&r.setReaders(e.data.readers)}}function E(){var t,n;return"undefined"!=typeof e&&(n=e),t=new Blob(["("+C.toString()+")("+n+");"],{type:"text/javascript"}),window.URL.createObjectURL(t)}function T(e){L?L.setReaders(e):Z&&K.length>0&&K.forEach(function(t){t.worker.postMessage({cmd:"setReaders",readers:e})})}function R(e,t){var n=e-K.length;if(0===n)return t&&t();if(0>n){var r=K.slice(n);return r.forEach(function(e){e.worker.terminate()}),K=K.slice(0,n),t&&t()}for(var o=function(n){K.push(n),K.length>=e&&t&&t()},i=0;n>i;i++)_(o)}var S=r(17),O=S&&S.__esModule?function(){return S["default"]}:function(){return S};Object.defineProperty(O,"a",{get:O});var x=r(54),D=x&&x.__esModule?function(){return x["default"]}:function(){return x};Object.defineProperty(D,"a",{get:D});var P=r(150),A=P&&P.__esModule?function(){
	return P["default"]}:function(){return P};Object.defineProperty(A,"a",{get:A});var M,j,I,k,N,L,z,U=r(19),F=r(63),G=r(57),B=r(52),W=r(59),V=r(10),H=r(50),q=r(55),X=r(62),J=r(60),Y=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},$={clone:r(7)},Q={ctx:{image:null,overlay:null},dom:{image:null,overlay:null}},K=[],Z=!0,ee={};n["default"]={init:function(e,t,n){return ee=O.a.bind()({},q.a,e),n?(Z=!1,o(n),t()):void i(t)},start:function(){b()},stop:function(){I=!0,R(0),"LiveStream"===ee.inputStream.type&&(W.a.release(),M.clearEventHandlers())},pause:function(){I=!0},onDetected:function(e){B.a.subscribe("detected",e)},offDetected:function(e){B.a.unsubscribe("detected",e)},onProcessed:function(e){B.a.subscribe("processed",e)},offProcessed:function(e){B.a.unsubscribe("processed",e)},setReaders:function(e){T(e)},registerResultCollector:function(e){e&&"function"==typeof e.addResult&&(z=e)},canvas:Q,decodeSingle:function(e,t){var n=this;e=O.a.bind()({inputStream:{type:"ImageStream",sequence:!1,size:800,src:e.src},numOfWorkers:1,locator:{halfSample:!1}},e),this.init(e,function(){B.a.once("processed",function(e){n.stop(),t.call(null,e)},!0),b()})},ImageWrapper:U.a,ImageDebug:V.a,ResultCollector:H.a}},function(e,t,n){function r(e,t){return t?t.some(function(t){return Object.keys(t).every(function(n){return t[n]===e[n]})}):!1}function o(e,t){return"function"==typeof t?t(e):!0}var i=n(10);t.a={create:function(e){function t(t){return s&&t&&!r(t,e.blacklist)&&o(t,e.filter)}var n=document.createElement("canvas"),a=n.getContext("2d"),c=[],s=e.capacity||20,u=e.capture===!0;return{addResult:function(e,r,o){var d={};t(o)&&(s--,d.codeResult=o,u&&(n.width=r.x,n.height=r.y,i.a.drawImage(e,r,a),d.frame=n.toDataURL()),c.push(d))},getResults:function(){return c}}}}},function(e,t,n){var r={clone:n(7),dot:n(31)};t.a={create:function(e,t){function n(){o(e),i()}function o(e){s[e.id]=e,a.push(e)}function i(){var e,t=0;for(e=0;e<a.length;e++)t+=a[e].rad;c.rad=t/a.length,c.vec=r.clone([Math.cos(c.rad),Math.sin(c.rad)])}var a=[],c={rad:0,vec:r.clone([0,0])},s={};return n(),{add:function(e){s[e.id]||(o(e),i())},fits:function(e){var n=Math.abs(r.dot(e.point.vec,c.vec));return n>t},getPoints:function(){return a},getCenter:function(){return c}}},createPoint:function(e,t,n){return{rad:e[n],point:e,id:t}}}},function(e,t,n){t.a=function(){function e(e){return o[e]||(o[e]={subscribers:[]}),o[e]}function t(){o={}}function n(e,t){e.async?setTimeout(function(){e.callback(t)},4):e.callback(t)}function r(t,n,r){var o;if("function"==typeof n)o={callback:n,async:r};else if(o=n,!o.callback)throw"Callback was not specified on options";e(t).subscribers.push(o)}var o={};return{subscribe:function(e,t,n){return r(e,t,n)},publish:function(t,r){var o=e(t),i=o.subscribers;i.filter(function(e){return!!e.once}).forEach(function(e){n(e,r)}),o.subscribers=i.filter(function(e){return!e.once}),o.subscribers.forEach(function(e){n(e,r)})},once:function(e,t,n){r(e,{callback:t,async:n,once:!0})},unsubscribe:function(n,r){var o;n?(o=e(n),o&&r?o.subscribers=o.subscribers.filter(function(e){return e.callback!==r}):o.subscribers=[]):t()}}}()},function(e,t,n){function r(e,t,n){n||(n={data:null,size:t}),this.data=n.data,this.originalSize=n.size,this.I=n,this.from=e,this.size=t}r.prototype.show=function(e,t){var n,r,o,i,a,c,s;for(t||(t=1),n=e.getContext("2d"),e.width=this.size.x,e.height=this.size.y,r=n.getImageData(0,0,e.width,e.height),o=r.data,i=0,a=0;a<this.size.y;a++)for(c=0;c<this.size.x;c++)s=a*this.size.x+c,i=this.get(c,a)*t,o[4*s+0]=i,o[4*s+1]=i,o[4*s+2]=i,o[4*s+3]=255;r.data=o,n.putImageData(r,0,0)},r.prototype.get=function(e,t){return this.data[(this.from.y+t)*this.originalSize.x+this.from.x+e]},r.prototype.updateData=function(e){this.originalSize=e.size,this.data=e.data},r.prototype.updateFrom=function(e){return this.from=e,this},t.a=r},function(e,t){"undefined"!=typeof window&&(window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)}}()),Math.imul=Math.imul||function(e,t){var n=e>>>16&65535,r=65535&e,o=t>>>16&65535,i=65535&t;return r*i+(n*i+r*o<<16>>>0)|0}},function(e,t,n){var r=void 0;r=n(56),t.a=r},function(e,t,n){e.e={inputStream:{name:"Live",type:"LiveStream",constraints:{width:640,height:480,facingMode:"environment"},area:{top:"0%",right:"0%",left:"0%",bottom:"0%"},singleChannel:!1},locate:!0,numOfWorkers:4,decoder:{readers:["code_128_reader"]},locator:{halfSample:!0,patchSize:"medium"}}},function(e,t,n){var r=n(58),o=(n(10),n(67)),i=n(3),a=n(30),c=n(68),s=n(66),u=n(74),d=n(71),f=n(69),l=n(70),p=n(73),h=n(72),v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},m={code_128_reader:o.a,ean_reader:i.a,ean_5_reader:l.a,ean_2_reader:f.a,ean_8_reader:d.a,code_39_reader:a.a,code_39_vin_reader:c.a,codabar_reader:s.a,upc_reader:u.a,upc_e_reader:p.a,i2of5_reader:h.a};t.a={create:function(e,t){function n(){}function o(){e.readers.forEach(function(e){var t,n={},r=[];"object"===("undefined"==typeof e?"undefined":v(e))?(t=e.format,n=e.config):"string"==typeof e&&(t=e),n.supplements&&(r=n.supplements.map(function(e){return new m[e]})),p.push(new m[t](n,r))})}function i(){}function a(e,n,r){function o(t){var r={y:t*Math.sin(n),x:t*Math.cos(n)};e[0].y-=r.y,e[0].x-=r.x,e[1].y+=r.y,e[1].x+=r.x}for(o(r);r>1&&(!t.inImageWithBorder(e[0],0)||!t.inImageWithBorder(e[1],0));)r-=Math.ceil(r/2),o(-r);return e}function c(e){return[{x:(e[1][0]-e[0][0])/2+e[0][0],y:(e[1][1]-e[0][1])/2+e[0][1]},{x:(e[3][0]-e[2][0])/2+e[2][0],y:(e[3][1]-e[2][1])/2+e[2][1]}]}function s(e){var n,o=null,i=r.a.getBarcodeLine(t,e[0],e[1]);for(r.a.toBinaryLine(i),n=0;n<p.length&&null===o;n++)o=p[n].decodePattern(i.line);return null===o?null:{codeResult:o,barcodeLine:i}}function u(e,t,n){var r,o,i,a=Math.sqrt(Math.pow(e[1][0]-e[0][0],2)+Math.pow(e[1][1]-e[0][1],2)),c=16,u=null,d=Math.sin(n),f=Math.cos(n);for(r=1;c>r&&null===u;r++)o=a/c*r*(r%2===0?-1:1),i={y:o*d,x:o*f},t[0].y+=i.x,t[0].x-=i.y,t[1].y+=i.x,t[1].x-=i.y,u=s(t);return u}function d(e){return Math.sqrt(Math.pow(Math.abs(e[1].y-e[0].y),2)+Math.pow(Math.abs(e[1].x-e[0].x),2))}function f(e){var t,n,r,o;l.ctx.overlay;return t=c(e),o=d(t),n=Math.atan2(t[1].y-t[0].y,t[1].x-t[0].x),t=a(t,n,Math.floor(.1*o)),null===t?null:(r=s(t),null===r&&(r=u(e,t,n)),null===r?null:{codeResult:r.codeResult,line:t,angle:n,pattern:r.barcodeLine.line,threshold:r.barcodeLine.threshold})}var l={ctx:{frequency:null,pattern:null,overlay:null},dom:{frequency:null,pattern:null,overlay:null}},p=[];return n(),o(),i(),{decodeFromBoundingBox:function(e){return f(e)},decodeFromBoundingBoxes:function(t){var n,r,o=[],i=e.multiple;for(n=0;n<t.length;n++){var a=t[n];if(r=f(a)||{},r.box=a,i)o.push(r);else if(r.codeResult)return r}return i?{barcodes:o}:void 0},setReaders:function(t){e.readers=t,p.length=0,o()}}}}},function(e,t,n){var r=(n(19),{}),o={DIR:{UP:1,DOWN:-1}};r.getBarcodeLine=function(e,t,n){function r(e,t){f=y[t*b+e],_+=f,w=w>f?f:w,C=f>C?f:C,g.push(f)}var o,i,a,c,s,u,d,f,l=0|t.x,p=0|t.y,h=0|n.x,v=0|n.y,m=Math.abs(v-p)>Math.abs(h-l),g=[],y=e.data,b=e.size.x,_=0,w=255,C=0;for(m&&(u=l,l=p,p=u,u=h,h=v,v=u),l>h&&(u=l,l=h,h=u,u=p,p=v,v=u),o=h-l,i=Math.abs(v-p),a=o/2|0,s=p,c=v>p?1:-1,d=l;h>d;d++)m?r(s,d):r(d,s),a-=i,0>a&&(s+=c,a+=o);return{line:g,min:w,max:C}},r.toBinaryLine=function(e){var t,n,r,i,a,c,s=e.min,u=e.max,d=e.line,f=s+(u-s)/2,l=[],p=(u-s)/12,h=-p;for(r=d[0]>f?o.DIR.UP:o.DIR.DOWN,l.push({pos:0,val:d[0]}),a=0;a<d.length-2;a++)t=d[a+1]-d[a],n=d[a+2]-d[a+1],i=h>t+n&&d[a+1]<1.5*f?o.DIR.DOWN:t+n>p&&d[a+1]>.5*f?o.DIR.UP:r,r!==i&&(l.push({pos:a,val:d[a]}),r=i);for(l.push({pos:d.length,val:d[d.length-1]}),c=l[0].pos;c<l[1].pos;c++)d[c]=d[c]>f?0:1;for(a=1;a<l.length-1;a++)for(p=l[a+1].val>l[a].val?l[a].val+(l[a+1].val-l[a].val)/3*2|0:l[a+1].val+(l[a].val-l[a+1].val)/3|0,c=l[a].pos;c<l[a+1].pos;c++)d[c]=d[c]>p?0:1;return{line:d,threshold:p}},r.debug={printFrequency:function(e,t){var n,r=t.getContext("2d");for(t.width=e.length,t.height=256,r.beginPath(),r.strokeStyle="blue",n=0;n<e.length;n++)r.moveTo(n,255),r.lineTo(n,255-e[n]);r.stroke(),r.closePath()},printPattern:function(e,t){var n,r=t.getContext("2d");for(t.width=e.length,r.fillColor="black",n=0;n<e.length;n++)1===e[n]&&r.fillRect(n,0,1,100)}},t.a=r},function(e,t,n){function r(e){return new Promise(function(t,n){function r(){o>0?e.videoWidth>0&&e.videoHeight>0?t():window.setTimeout(r,500):n("Unable to play video stream. Is webcam working?"),o--}var o=10;r()})}function o(e,t){return navigator.mediaDevices.getUserMedia(t).then(function(t){return new Promise(function(n){l=t,e.setAttribute("autoplay","true"),e.srcObject=t,e.addEventListener("loadedmetadata",function(){e.play(),n()})})}).then(r.bind(null,e))}function i(e){var t=u.a.bind()(e,["width","height","facingMode","aspectRatio","deviceId"]);return"undefined"!=typeof e.minAspectRatio&&e.minAspectRatio>0&&(t.aspectRatio=e.minAspectRatio,console.log("WARNING: Constraint 'minAspectRatio' is deprecated; Use 'aspectRatio' instead")),"undefined"!=typeof e.facing&&(t.facingMode=e.facing,console.log("WARNING: Constraint 'facing' is deprecated. Use 'facingMode' instead'")),t}function a(e,t){return"undefined"==typeof t.video.deviceId&&e?"undefined"!=typeof MediaStreamTrack&&"undefined"!=typeof MediaStreamTrack.getSources?new Promise(function(n){MediaStreamTrack.getSources(function(r){var o=r.filter(function(t){return"video"===t.kind&&t.facing===e})[0];return n(o?f.a.bind()({},t,{video:{deviceId:o.id}}):t)})}):Promise.resolve(f.a.bind()({},t,{video:{facingMode:e}})):Promise.resolve(t)}function c(e){var t={audio:!1,video:i(e)};return a(t.video.facingMode,t)}var s=n(145),u=s&&s.__esModule?function(){return s["default"]}:function(){return s};Object.defineProperty(u,"a",{get:u});var d=n(17),f=d&&d.__esModule?function(){return d["default"]}:function(){return d};Object.defineProperty(f,"a",{get:f});var l;t.a={request:function(e,t){return c(t).then(o.bind(null,e))},release:function(){var e=l&&l.getVideoTracks();e&&e.length&&e[0].stop(),l=null}}},function(e,t,n){var r=n(18),o={};o.create=function(e,t){var n,o={},i=e.getConfig(),a=(r.f.bind()(e.getRealWidth(),e.getRealHeight()),e.getCanvasSize()),c=r.f.bind()(e.getWidth(),e.getHeight()),s=e.getTopRight(),u=s.x,d=s.y,f=null,l=null;return n=t?t:document.createElement("canvas"),n.width=a.x,n.height=a.y,f=n.getContext("2d"),l=new Uint8Array(c.x*c.y),o.attachData=function(e){l=e},o.getData=function(){return l},o.grab=function(){var t,n=i.halfSample,o=e.getFrame();return o?(f.drawImage(o,0,0,a.x,a.y),t=f.getImageData(u,d,c.x,c.y).data,n?r.i.bind()(t,c,l):r.j.bind()(t,l,i),!0):!1},o.getSize=function(){return c},o},t.a=o},function(e,t,n){function r(e,t){e.onload=function(){t.loaded(this)}}var o={};o.load=function(e,t,n,o,i){var a,c,s,u=new Array(o),d=new Array(u.length);if(i===!1)u[0]=e;else for(a=0;a<u.length;a++)s=n+a,u[a]=e+"image-"+("00"+s).slice(-3)+".jpg";for(d.notLoaded=[],d.addImage=function(e){d.notLoaded.push(e)},d.loaded=function(e){for(var n=d.notLoaded,r=0;r<n.length;r++)if(n[r]===e){n.splice(r,1);for(var o=0;o<u.length;o++){var i=u[o].substr(u[o].lastIndexOf("/"));if(-1!==e.src.lastIndexOf(i)){d[o]=e;break}}break}0===n.length&&t.apply(null,[d])},a=0;a<u.length;a++)c=new Image,d.addImage(c),r(c,d),c.src=u[a]},t.a=o},function(e,t,n){var r=n(61),o={};o.createVideoStream=function(e){function t(){var t=e.videoWidth,o=e.videoHeight;n=i.size?t/o>1?i.size:Math.floor(t/o*i.size):t,r=i.size?t/o>1?Math.floor(o/t*i.size):i.size:o,u.x=n,u.y=r}var n,r,o={},i=null,a=["canrecord","ended"],c={},s={x:0,y:0},u={x:0,y:0};return o.getRealWidth=function(){return e.videoWidth},o.getRealHeight=function(){return e.videoHeight},o.getWidth=function(){return n},o.getHeight=function(){return r},o.setWidth=function(e){n=e},o.setHeight=function(e){r=e},o.setInputStream=function(t){i=t,e.src="undefined"!=typeof t.src?t.src:""},o.ended=function(){return e.ended},o.getConfig=function(){return i},o.setAttribute=function(t,n){e.setAttribute(t,n)},o.pause=function(){e.pause()},o.play=function(){e.play()},o.setCurrentTime=function(t){"LiveStream"!==i.type&&(e.currentTime=t)},o.addEventListener=function(t,n,r){-1!==a.indexOf(t)?(c[t]||(c[t]=[]),c[t].push(n)):e.addEventListener(t,n,r)},o.clearEventHandlers=function(){a.forEach(function(t){var n=c[t];n&&n.length>0&&n.forEach(function(n){e.removeEventListener(t,n)})})},o.trigger=function(e,n){var r,i=c[e];if("canrecord"===e&&t(),i&&i.length>0)for(r=0;r<i.length;r++)i[r].apply(o,n)},o.setTopRight=function(e){s.x=e.x,s.y=e.y},o.getTopRight=function(){return s},o.setCanvasSize=function(e){u.x=e.x,u.y=e.y},o.getCanvasSize=function(){return u},o.getFrame=function(){return e},o},o.createLiveStream=function(e){e.setAttribute("autoplay",!0);var t=o.createVideoStream(e);return t.ended=function(){return!1},t},o.createImageStream=function(){function e(){f=!1,r.a.load(v,function(e){l=e,c=e[0].width,s=e[0].height,n=a.size?c/s>1?a.size:Math.floor(c/s*a.size):c,o=a.size?c/s>1?Math.floor(s/c*a.size):a.size:s,_.x=n,_.y=o,f=!0,u=0,setTimeout(function(){t("canrecord",[])},0)},h,p,a.sequence)}function t(e,t){var n,r=y[e];if(r&&r.length>0)for(n=0;n<r.length;n++)r[n].apply(i,t)}var n,o,i={},a=null,c=0,s=0,u=0,d=!0,f=!1,l=null,p=0,h=1,v=null,m=!1,g=["canrecord","ended"],y={},b={x:0,y:0},_={x:0,y:0};return i.trigger=t,i.getWidth=function(){return n},i.getHeight=function(){return o},i.setWidth=function(e){n=e},i.setHeight=function(e){o=e},i.getRealWidth=function(){return c},i.getRealHeight=function(){return s},i.setInputStream=function(t){a=t,t.sequence===!1?(v=t.src,p=1):(v=t.src,p=t.length),e()},i.ended=function(){return m},i.setAttribute=function(){},i.getConfig=function(){return a},i.pause=function(){d=!0},i.play=function(){d=!1},i.setCurrentTime=function(e){u=e},i.addEventListener=function(e,t){-1!==g.indexOf(e)&&(y[e]||(y[e]=[]),y[e].push(t))},i.setTopRight=function(e){b.x=e.x,b.y=e.y},i.getTopRight=function(){return b},i.setCanvasSize=function(e){_.x=e.x,_.y=e.y},i.getCanvasSize=function(){return _},i.getFrame=function(){var e;return f?(d||(e=l[u],p-1>u?u++:setTimeout(function(){m=!0,t("ended",[])},0)),e):null},i},t.a=o},function(e,t,n){(function(e){function r(){var t;v=h.halfSample?new S.a({x:T.size.x/2|0,y:T.size.y/2|0}):T,E=O.b.bind()(h.patchSize,v.size),k.x=v.size.x/E.x|0,k.y=v.size.y/E.y|0,C=new S.a(v.size,void 0,Uint8Array,!1),y=new S.a(E,void 0,Array,!0),t=new ArrayBuffer(65536),g=new S.a(E,new Uint8Array(t,0,E.x*E.y)),m=new S.a(E,new Uint8Array(t,E.x*E.y*3,E.x*E.y),void 0,!0),R=A.a.bind()("undefined"!=typeof window?window:"undefined"!=typeof self?self:e,{size:E.x},t),w=new S.a({x:v.size.x/g.size.x|0,y:v.size.y/g.size.y|0},void 0,Array,!0),b=new S.a(w.size,void 0,void 0,!0),_=new S.a(w.size,void 0,Int32Array,!0)}function o(){h.useWorker||"undefined"==typeof document||(I.dom.binary=document.createElement("canvas"),I.dom.binary.className="binaryBuffer",I.ctx.binary=I.dom.binary.getContext("2d"),I.dom.binary.width=C.size.x,I.dom.binary.height=C.size.y)}function i(e){var t,n,r,o,i,a,c,s=C.size.x,u=C.size.y,d=-C.size.x,f=-C.size.y;for(t=0,n=0;n<e.length;n++)o=e[n],t+=o.rad;for(t/=e.length,t=(180*t/Math.PI+90)%180-90,0>t&&(t+=180),t=(180-t)*Math.PI/180,i=j.copy(j.create(),[Math.cos(t),Math.sin(t),-Math.sin(t),Math.cos(t)]),n=0;n<e.length;n++)for(o=e[n],r=0;4>r;r++)M.transformMat2(o.box[r],o.box[r],i);for(n=0;n<e.length;n++)for(o=e[n],r=0;4>r;r++)o.box[r][0]<s&&(s=o.box[r][0]),o.box[r][0]>d&&(d=o.box[r][0]),o.box[r][1]<u&&(u=o.box[r][1]),o.box[r][1]>f&&(f=o.box[r][1]);for(a=[[s,u],[d,u],[d,f],[s,f]],c=h.halfSample?2:1,i=j.invert(i,i),r=0;4>r;r++)M.transformMat2(a[r],a[r],i);for(r=0;4>r;r++)M.scale(a[r],a[r],c);return a}function a(){O.c.bind()(v,C),C.zeroBorder()}function c(){var e,t,n,r,o,i,a,c=[];for(e=0;e<k.x;e++)for(t=0;t<k.y;t++)n=g.size.x*e,r=g.size.y*t,f(n,r),m.zeroBorder(),x.a.init(y.data,0),i=D.a.create(m,y),a=i.rasterize(0),o=y.moments(a.count),c=c.concat(l(o,[e,t],n,r));return c}function s(e){var t,n,r=[],o=[];for(t=0;e>t;t++)r.push(0);for(n=_.data.length;n--;)_.data[n]>0&&r[_.data[n]-1]++;return r=r.map(function(e,t){return{val:e,label:t+1}}),r.sort(function(e,t){return t.val-e.val}),o=r.filter(function(e){return e.val>=5})}function u(e,t){var n,r,o,a,c=[],s=[];for(n=0;n<e.length;n++){for(r=_.data.length,c.length=0;r--;)_.data[r]===e[n].label&&(o=w.data[r],c.push(o));a=i(c),a&&s.push(a)}return s}function d(e){var t=O.d.bind()(e,.9),n=O.e.bind()(t,1,function(e){return e.getPoints().length}),r=[],o=[];if(1===n.length){r=n[0].item.getPoints();for(var i=0;i<r.length;i++)o.push(r[i].point)}return o}function f(e,t){C.subImageAsCopy(g,O.f.bind()(e,t)),R.skeletonize()}function l(e,t,n,r){var o,i,a,c,s=[],u=[],f=Math.ceil(E.x/3);if(e.length>=2){for(o=0;o<e.length;o++)e[o].m00>f&&s.push(e[o]);if(s.length>=2){for(a=d(s),i=0,o=0;o<a.length;o++)i+=a[o].rad;a.length>1&&a.length>=s.length/4*3&&a.length>e.length/4&&(i/=a.length,c={index:t[1]*k.x+t[0],pos:{x:n,y:r},box:[M.clone([n,r]),M.clone([n+g.size.x,r]),M.clone([n+g.size.x,r+g.size.y]),M.clone([n,r+g.size.y])],moments:a,rad:i,vec:M.clone([Math.cos(i),Math.sin(i)])},u.push(c))}}return u}function p(e){function t(){var e;for(e=0;e<_.data.length;e++)if(0===_.data[e]&&1===b.data[e])return e;return _.length}function n(e){var t,r,o,c,s,u,d={x:e%_.size.x,y:e/_.size.x|0};if(e<_.data.length)for(o=w.data[e],_.data[e]=i,s=0;s<P.a.searchDirections.length;s++)r=d.y+P.a.searchDirections[s][0],t=d.x+P.a.searchDirections[s][1],c=r*_.size.x+t,0!==b.data[c]?0===_.data[c]&&(u=Math.abs(M.dot(w.data[c].vec,o.vec)),u>a&&n(c)):_.data[c]=Number.MAX_VALUE}var r,o,i=0,a=.95,c=0;for(x.a.init(b.data,0),x.a.init(_.data,0),x.a.init(w.data,null),r=0;r<e.length;r++)o=e[r],w.data[o.index]=o,b.data[o.index]=1;for(b.zeroBorder();(c=t())<_.data.length;)i++,n(c);return i}var h,v,m,g,y,b,_,w,C,E,T,R,S=n(19),O=n(18),x=n(9),D=(n(10),n(64)),P=n(29),A=n(65),M={clone:n(7),dot:n(31),scale:n(78),transformMat2:n(79)},j={copy:n(75),create:n(76),invert:n(77)},I={ctx:{binary:null},dom:{binary:null}},k={x:0,y:0};t.a={init:function(e,t){h=t,T=e,r(),o()},locate:function(){var e,t,n;if(h.halfSample&&O.g.bind()(T,v),a(),e=c(),e.length<k.x*k.y*.05)return null;var r=p(e);return 1>r?null:(t=s(r),0===t.length?null:n=u(t,r))},checkImageConstraints:function(e,t){var n,r,o,i=e.getWidth(),a=e.getHeight(),c=t.halfSample?.5:1;if(e.getConfig().area&&(o=O.h.bind()(i,a,e.getConfig().area),e.setTopRight({x:o.sx,y:o.sy}),e.setCanvasSize({x:i,y:a}),i=o.sw,a=o.sh),r={x:Math.floor(i*c),y:Math.floor(a*c)},n=O.b.bind()(t.patchSize,r),e.setWidth(Math.floor(Math.floor(r.x/n.x)*(1/c)*n.x)),e.setHeight(Math.floor(Math.floor(r.y/n.y)*(1/c)*n.y)),e.getWidth()%n.x===0&&e.getHeight()%n.y===0)return!0;throw new Error("Image dimensions do not comply with the current settings: Width ("+i+" )and height ("+a+") must a multiple of "+n.x)}}}).call(t,function(){return this}())},function(e,t,n){var r=n(29),o={createContour2D:function(){return{dir:null,index:null,firstVertex:null,insideContours:null,nextpeer:null,prevpeer:null}},CONTOUR_DIR:{CW_DIR:0,CCW_DIR:1,UNKNOWN_DIR:2},DIR:{OUTSIDE_EDGE:-32767,INSIDE_EDGE:-32766},create:function(e,t){var n=e.data,i=t.data,a=e.size.x,c=e.size.y,s=r.a.create(e,t);return{rasterize:function(e){var t,r,u,d,f,l,p,h,v,m,g,y,b=[],_=0;for(y=0;400>y;y++)b[y]=0;for(b[0]=n[0],v=null,l=1;c-1>l;l++)for(d=0,r=b[0],f=1;a-1>f;f++)if(g=l*a+f,0===i[g])if(t=n[g],t!==r){if(0===d)u=_+1,b[u]=t,r=t,p=s.contourTracing(l,f,u,t,o.DIR.OUTSIDE_EDGE),null!==p&&(_++,d=u,h=o.createContour2D(),h.dir=o.CONTOUR_DIR.CW_DIR,h.index=d,h.firstVertex=p,h.nextpeer=v,h.insideContours=null,null!==v&&(v.prevpeer=h),v=h);else if(p=s.contourTracing(l,f,o.DIR.INSIDE_EDGE,t,d),null!==p){for(h=o.createContour2D(),h.firstVertex=p,h.insideContours=null,0===e?h.dir=o.CONTOUR_DIR.CCW_DIR:h.dir=o.CONTOUR_DIR.CW_DIR,h.index=e,m=v;null!==m&&m.index!==d;)m=m.nextpeer;null!==m&&(h.nextpeer=m.insideContours,null!==m.insideContours&&(m.insideContours.prevpeer=h),m.insideContours=h)}}else i[g]=d;else i[g]===o.DIR.OUTSIDE_EDGE||i[g]===o.DIR.INSIDE_EDGE?(d=0,r=i[g]===o.DIR.INSIDE_EDGE?n[g]:b[0]):(d=i[g],r=b[d]);for(m=v;null!==m;)m.index=e,m=m.nextpeer;return{cc:v,count:_}},debug:{drawContour:function(e,t){var n,r,i,a=e.getContext("2d"),c=t;for(a.strokeStyle="red",a.fillStyle="red",a.lineWidth=1,n=null!==c?c.insideContours:null;null!==c;){switch(null!==n?(r=n,n=n.nextpeer):(r=c,c=c.nextpeer,n=null!==c?c.insideContours:null),r.dir){case o.CONTOUR_DIR.CW_DIR:a.strokeStyle="red";break;case o.CONTOUR_DIR.CCW_DIR:a.strokeStyle="blue";break;case o.CONTOUR_DIR.UNKNOWN_DIR:a.strokeStyle="green"}i=r.firstVertex,a.beginPath(),a.moveTo(i.x,i.y);do i=i.next,a.lineTo(i.x,i.y);while(i!==r.firstVertex);a.stroke()}}}}}};t.a=o},function(module, exports, __webpack_require__) {function Skeletonizer(stdlib, foreign, buffer) {"use asm";var images=new stdlib.Uint8Array(buffer),size=foreign.size|0,imul=stdlib.Math.imul;function erode(inImagePtr, outImagePtr) {inImagePtr=inImagePtr|0;outImagePtr=outImagePtr|0;var v=0,u=0,sum=0,yStart1=0,yStart2=0,xStart1=0,xStart2=0,offset=0;for (v=1; (v|0)<(size - 1|0); v=v+1|0) {offset=offset+size|0;for (u=1; (u|0)<(size - 1|0); u=u+1|0) {yStart1=offset - size|0;yStart2=offset+size|0;xStart1=u - 1|0;xStart2=u+1|0;sum=(images[inImagePtr+yStart1+xStart1|0]|0)+(images[inImagePtr+yStart1+xStart2|0]|0)+(images[inImagePtr+offset+u|0]|0)+(images[inImagePtr+yStart2+xStart1|0]|0)+(images[inImagePtr+yStart2+xStart2|0]|0)|0;if ((sum|0) == (5|0)) {images[outImagePtr+offset+u|0]=1;} else {images[outImagePtr+offset+u|0]=0;}}}return;}function subtract(aImagePtr, bImagePtr, outImagePtr) {aImagePtr=aImagePtr|0;bImagePtr=bImagePtr|0;outImagePtr=outImagePtr|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[outImagePtr+length|0]=(images[aImagePtr+length|0]|0) - (images[bImagePtr+length|0]|0)|0;}}function bitwiseOr(aImagePtr, bImagePtr, outImagePtr) {aImagePtr=aImagePtr|0;bImagePtr=bImagePtr|0;outImagePtr=outImagePtr|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[outImagePtr+length|0]=images[aImagePtr+length|0]|0|(images[bImagePtr+length|0]|0)|0;}}function countNonZero(imagePtr) {imagePtr=imagePtr|0;var sum=0,length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;sum=(sum|0)+(images[imagePtr+length|0]|0)|0;}return sum|0;}function init(imagePtr, value) {imagePtr=imagePtr|0;value=value|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[imagePtr+length|0]=value;}}function dilate(inImagePtr, outImagePtr) {inImagePtr=inImagePtr|0;outImagePtr=outImagePtr|0;var v=0,u=0,sum=0,yStart1=0,yStart2=0,xStart1=0,xStart2=0,offset=0;for (v=1; (v|0)<(size - 1|0); v=v+1|0) {offset=offset+size|0;for (u=1; (u|0)<(size - 1|0); u=u+1|0) {yStart1=offset - size|0;yStart2=offset+size|0;xStart1=u - 1|0;xStart2=u+1|0;sum=(images[inImagePtr+yStart1+xStart1|0]|0)+(images[inImagePtr+yStart1+xStart2|0]|0)+(images[inImagePtr+offset+u|0]|0)+(images[inImagePtr+yStart2+xStart1|0]|0)+(images[inImagePtr+yStart2+xStart2|0]|0)|0;if ((sum|0)>(0|0)) {images[outImagePtr+offset+u|0]=1;} else {images[outImagePtr+offset+u|0]=0;}}}return;}function memcpy(srcImagePtr, dstImagePtr) {srcImagePtr=srcImagePtr|0;dstImagePtr=dstImagePtr|0;var length=0;length=imul(size, size)|0;while ((length|0)>0) {length=length - 1|0;images[dstImagePtr+length|0]=images[srcImagePtr+length|0]|0;}}function zeroBorder(imagePtr) {imagePtr=imagePtr|0;var x=0,y=0;for (x=0; (x|0)<(size - 1|0); x=x+1|0) {images[imagePtr+x|0]=0;images[imagePtr+y|0]=0;y=y+size - 1|0;images[imagePtr+y|0]=0;y=y+1|0;}for (x=0; (x|0)<(size|0); x=x+1|0) {images[imagePtr+y|0]=0;y=y+1|0;}}function skeletonize() {var subImagePtr=0,erodedImagePtr=0,tempImagePtr=0,skelImagePtr=0,sum=0,done=0;erodedImagePtr=imul(size, size)|0;tempImagePtr=erodedImagePtr+erodedImagePtr|0;skelImagePtr=tempImagePtr+erodedImagePtr|0;init(skelImagePtr, 0);zeroBorder(subImagePtr);do {erode(subImagePtr, erodedImagePtr);dilate(erodedImagePtr, tempImagePtr);subtract(subImagePtr, tempImagePtr, tempImagePtr);bitwiseOr(skelImagePtr, tempImagePtr, skelImagePtr);memcpy(erodedImagePtr, subImagePtr);sum=countNonZero(subImagePtr)|0;done=(sum|0) == 0|0;} while (!done);}return {skeletonize: skeletonize};} exports["a"]=Skeletonizer; },function(e,t,n){function r(){o.a.call(this),this._counters=[]}var o=n(6),i={ALPHABETH_STRING:{value:"0123456789-$:/.+ABCD"},ALPHABET:{value:[48,49,50,51,52,53,54,55,56,57,45,36,58,47,46,43,65,66,67,68]},CHARACTER_ENCODINGS:{value:[3,6,9,96,18,66,33,36,48,72,12,24,69,81,84,21,26,41,11,14]},START_END:{value:[26,41,11,14]},MIN_ENCODED_CHARS:{value:4},MAX_ACCEPTABLE:{value:2},PADDING:{value:1.5},FORMAT:{value:"codabar",writeable:!1}};r.prototype=Object.create(o.a.prototype,i),r.prototype.constructor=r,r.prototype._decode=function(){var e,t,n,r,o,i=this,a=[];if(this._counters=i._fillCounters(),e=i._findStart(),!e)return null;r=e.startCounter;do{if(n=i._toPattern(r),0>n)return null;if(t=i._patternToChar(n),0>t)return null;if(a.push(t),r+=8,a.length>1&&i._isStartEnd(n))break}while(r<i._counters.length);return a.length-2<i.MIN_ENCODED_CHARS||!i._isStartEnd(n)?null:i._verifyWhitespace(e.startCounter,r-8)&&i._validateResult(a,e.startCounter)?(r=r>i._counters.length?i._counters.length:r,o=e.start+i._sumCounters(e.startCounter,r-8),{code:a.join(""),start:e.start,end:o,startInfo:e,decodedCodes:a}):null},r.prototype._verifyWhitespace=function(e,t){return(0>=e-1||this._counters[e-1]>=this._calculatePatternLength(e)/2)&&(t+8>=this._counters.length||this._counters[t+7]>=this._calculatePatternLength(t)/2)},r.prototype._calculatePatternLength=function(e){var t,n=0;for(t=e;e+7>t;t++)n+=this._counters[t];return n},r.prototype._thresholdResultPattern=function(e,t){var n,r,o,i,a,c=this,s={space:{narrow:{size:0,counts:0,min:0,max:Number.MAX_VALUE},wide:{size:0,counts:0,min:0,max:Number.MAX_VALUE}},bar:{narrow:{size:0,counts:0,min:0,max:Number.MAX_VALUE},wide:{size:0,counts:0,min:0,max:Number.MAX_VALUE}}},u=t;for(o=0;o<e.length;o++){for(a=c._charToPattern(e[o]),i=6;i>=0;i--)n=2===(1&i)?s.bar:s.space,r=1===(1&a)?n.wide:n.narrow,r.size+=c._counters[u+i],r.counts++,a>>=1;u+=8}return["space","bar"].forEach(function(e){var t=s[e];t.wide.min=Math.floor((t.narrow.size/t.narrow.counts+t.wide.size/t.wide.counts)/2),t.narrow.max=Math.ceil(t.wide.min),t.wide.max=Math.ceil((t.wide.size*c.MAX_ACCEPTABLE+c.PADDING)/t.wide.counts)}),s},r.prototype._charToPattern=function(e){var t,n=this,r=e.charCodeAt(0);for(t=0;t<n.ALPHABET.length;t++)if(n.ALPHABET[t]===r)return n.CHARACTER_ENCODINGS[t];return 0},r.prototype._validateResult=function(e,t){var n,r,o,i,a,c,s=this,u=s._thresholdResultPattern(e,t),d=t;for(n=0;n<e.length;n++){for(c=s._charToPattern(e[n]),r=6;r>=0;r--){if(o=0===(1&r)?u.bar:u.space,i=1===(1&c)?o.wide:o.narrow,a=s._counters[d+r],a<i.min||a>i.max)return!1;c>>=1}d+=8}return!0},r.prototype._patternToChar=function(e){var t,n=this;for(t=0;t<n.CHARACTER_ENCODINGS.length;t++)if(n.CHARACTER_ENCODINGS[t]===e)return String.fromCharCode(n.ALPHABET[t]);return-1},r.prototype._computeAlternatingThreshold=function(e,t){var n,r,o=Number.MAX_VALUE,i=0;for(n=e;t>n;n+=2)r=this._counters[n],r>i&&(i=r),o>r&&(o=r);return(o+i)/2|0},r.prototype._toPattern=function(e){var t,n,r,o,i=7,a=e+i,c=1<<i-1,s=0;if(a>this._counters.length)return-1;for(t=this._computeAlternatingThreshold(e,a),n=this._computeAlternatingThreshold(e+1,a),r=0;i>r;r++)o=0===(1&r)?t:n,this._counters[e+r]>o&&(s|=c),c>>=1;return s},r.prototype._isStartEnd=function(e){var t;for(t=0;t<this.START_END.length;t++)if(this.START_END[t]===e)return!0;return!1},r.prototype._sumCounters=function(e,t){var n,r=0;for(n=e;t>n;n++)r+=this._counters[n];return r},r.prototype._findStart=function(){var e,t,n,r=this,o=r._nextUnset(r._row);for(e=1;e<this._counters.length;e++)if(t=r._toPattern(e),-1!==t&&r._isStartEnd(t))return o+=r._sumCounters(0,e),n=o+r._sumCounters(e,e+8),{start:o,end:n,startCounter:e,endCounter:e+8}},t.a=r},function(e,t,n){function r(){i.a.call(this)}function o(e,t,n){for(var r=n.length,o=0,i=0;r--;)i+=e[n[r]],o+=t[n[r]];return i/o}var i=n(6),a={CODE_SHIFT:{value:98},CODE_C:{value:99},CODE_B:{value:100},CODE_A:{value:101},START_CODE_A:{value:103},START_CODE_B:{value:104},START_CODE_C:{value:105},STOP_CODE:{value:106},CODE_PATTERN:{value:[[2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],[1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],[2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],[1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],[2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],[3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],[2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],[1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],[2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],[2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],[3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],[3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],[1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],[1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],[2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],[1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],[1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],[2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],[1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],[1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],[2,1,1,2,3,2],[2,3,3,1,1,1,2]]},SINGLE_CODE_ERROR:{value:.64},AVG_CODE_ERROR:{value:.3},FORMAT:{value:"code_128",writeable:!1},MODULE_INDICES:{value:{bar:[0,2,4],space:[1,3,5]}}};r.prototype=Object.create(i.a.prototype,a),r.prototype.constructor=r,r.prototype._decodeCode=function(e,t){var n,r,i,a=[0,0,0,0,0,0],c=this,s=e,u=!c._row[s],d=0,f={error:Number.MAX_VALUE,code:-1,start:e,end:e,correction:{bar:1,space:1}};for(n=s;n<c._row.length;n++)if(c._row[n]^u)a[d]++;else{if(d===a.length-1){for(t&&c._correct(a,t),r=0;r<c.CODE_PATTERN.length;r++)i=c._matchPattern(a,c.CODE_PATTERN[r]),i<f.error&&(f.code=r,f.error=i);return f.end=n,-1===f.code||f.error>c.AVG_CODE_ERROR?null:(c.CODE_PATTERN[f.code]&&(f.correction.bar=o(c.CODE_PATTERN[f.code],a,this.MODULE_INDICES.bar),f.correction.space=o(c.CODE_PATTERN[f.code],a,this.MODULE_INDICES.space)),f)}d++,a[d]=1,u=!u}return null},r.prototype._correct=function(e,t){this._correctBars(e,t.bar,this.MODULE_INDICES.bar),this._correctBars(e,t.space,this.MODULE_INDICES.space)},r.prototype._findStart=function(){var e,t,n,r,i,a=[0,0,0,0,0,0],c=this,s=c._nextSet(c._row),u=!1,d=0,f={error:Number.MAX_VALUE,code:-1,start:0,end:0,correction:{bar:1,space:1}};for(e=s;e<c._row.length;e++)if(c._row[e]^u)a[d]++;else{if(d===a.length-1){for(i=0,r=0;r<a.length;r++)i+=a[r];for(t=c.START_CODE_A;t<=c.START_CODE_C;t++)n=c._matchPattern(a,c.CODE_PATTERN[t]),n<f.error&&(f.code=t,f.error=n);if(f.error<c.AVG_CODE_ERROR)return f.start=e-i,f.end=e,f.correction.bar=o(c.CODE_PATTERN[f.code],a,this.MODULE_INDICES.bar),f.correction.space=o(c.CODE_PATTERN[f.code],a,this.MODULE_INDICES.space),f;for(r=0;4>r;r++)a[r]=a[r+2];a[4]=0,a[5]=0,d--}else d++;a[d]=1,u=!u}return null},r.prototype._decode=function(){var e,t,n=this,r=n._findStart(),o=null,i=!1,a=[],c=0,s=0,u=[],d=[],f=!1,l=!0;if(null===r)return null;switch(o={code:r.code,start:r.start,end:r.end,correction:{bar:r.correction.bar,space:r.correction.space}},d.push(o),s=o.code,o.code){case n.START_CODE_A:e=n.CODE_A;break;case n.START_CODE_B:e=n.CODE_B;break;case n.START_CODE_C:e=n.CODE_C;break;default:return null}for(;!i;){if(t=f,f=!1,o=n._decodeCode(o.end,o.correction),null!==o)switch(o.code!==n.STOP_CODE&&(l=!0),o.code!==n.STOP_CODE&&(u.push(o.code),c++,s+=c*o.code),d.push(o),e){case n.CODE_A:if(o.code<64)a.push(String.fromCharCode(32+o.code));else if(o.code<96)a.push(String.fromCharCode(o.code-64));else switch(o.code!==n.STOP_CODE&&(l=!1),o.code){case n.CODE_SHIFT:f=!0,e=n.CODE_B;break;case n.CODE_B:e=n.CODE_B;break;case n.CODE_C:e=n.CODE_C;break;case n.STOP_CODE:i=!0}break;case n.CODE_B:if(o.code<96)a.push(String.fromCharCode(32+o.code));else switch(o.code!==n.STOP_CODE&&(l=!1),o.code){case n.CODE_SHIFT:f=!0,e=n.CODE_A;break;case n.CODE_A:e=n.CODE_A;break;case n.CODE_C:e=n.CODE_C;break;case n.STOP_CODE:i=!0}break;case n.CODE_C:if(o.code<100)a.push(o.code<10?"0"+o.code:o.code);else switch(o.code!==n.STOP_CODE&&(l=!1),o.code){case n.CODE_A:e=n.CODE_A;break;case n.CODE_B:e=n.CODE_B;break;case n.STOP_CODE:i=!0}}else i=!0;t&&(e=e===n.CODE_A?n.CODE_B:n.CODE_A)}return null===o?null:(o.end=n._nextUnset(n._row,o.end),n._verifyTrailingWhitespace(o)?(s-=c*u[u.length-1],s%103!==u[u.length-1]?null:a.length?(l&&a.splice(a.length-1,1),{code:a.join(""),start:r.start,end:o.end,codeset:e,startInfo:r,decodedCodes:d,endInfo:o}):null):null)},i.a.prototype._verifyTrailingWhitespace=function(e){var t,n=this;return t=e.end+(e.end-e.start)/2,t<n._row.length&&n._matchRange(e.end,t,0)?e:null},t.a=r},function(e,t,n){function r(){o.a.call(this)}var o=n(30),i={IOQ:/[IOQ]/g,AZ09:/[A-Z0-9]{17}/};r.prototype=Object.create(o.a.prototype),r.prototype.constructor=r,r.prototype._decode=function(){var e=o.a.prototype._decode.apply(this);if(!e)return null;var t=e.code;return t?(t=t.replace(i.IOQ,""),t.match(i.AZ09)&&this._checkChecksum(t)?(e.code=t,e):null):null},r.prototype._checkChecksum=function(e){return!!e},t.a=r},function(e,t,n){function r(){o.a.call(this)}var o=n(3),i={FORMAT:{value:"ean_2",writeable:!1}};r.prototype=Object.create(o.a.prototype,i),r.prototype.constructor=r,r.prototype.decode=function(e,t){this._row=e;var n,r=0,o=0,i=t,a=this._row.length,c=[],s=[];for(o=0;2>o&&a>i;o++){if(n=this._decodeCode(i),!n)return null;s.push(n),c.push(n.code%10),n.code>=this.CODE_G_START&&(r|=1<<1-o),1!=o&&(i=this._nextSet(this._row,n.end),i=this._nextUnset(this._row,i))}return 2!=c.length||parseInt(c.join(""))%4!==r?null:{code:c.join(""),decodedCodes:s,end:n.end}},t.a=r},function(e,t,n){function r(){a.a.call(this)}function o(e){var t;for(t=0;10>t;t++)if(e===s[t])return t;return null}function i(e){var t,n=e.length,r=0;for(t=n-2;t>=0;t-=2)r+=e[t];for(r*=3,t=n-1;t>=0;t-=2)r+=e[t];return r*=3,r%10}var a=n(3),c={FORMAT:{value:"ean_5",writeable:!1}},s=[24,20,18,17,12,6,3,10,9,5];r.prototype=Object.create(a.a.prototype,c),r.prototype.constructor=r,r.prototype.decode=function(e,t){this._row=e;var n,r=0,a=0,c=t,s=this._row.length,u=[],d=[];for(a=0;5>a&&s>c;a++){if(n=this._decodeCode(c),!n)return null;d.push(n),u.push(n.code%10),n.code>=this.CODE_G_START&&(r|=1<<4-a),4!=a&&(c=this._nextSet(this._row,n.end),c=this._nextUnset(this._row,c))}return 5!=u.length?null:i(u)!==o(r)?null:{code:u.join(""),decodedCodes:d,end:n.end}},t.a=r},function(e,t,n){function r(e,t){o.a.call(this,e,t)}var o=n(3),i={FORMAT:{value:"ean_8",writeable:!1}};r.prototype=Object.create(o.a.prototype,i),r.prototype.constructor=r,r.prototype._decodePayload=function(e,t,n){var r,o=this;for(r=0;4>r;r++){if(e=o._decodeCode(e.end,o.CODE_G_START),!e)return null;t.push(e.code),n.push(e)}if(e=o._findPattern(o.MIDDLE_PATTERN,e.end,!0,!1),null===e)return null;for(n.push(e),r=0;4>r;r++){if(e=o._decodeCode(e.end,o.CODE_G_START),!e)return null;n.push(e),t.push(e.code)}return e},t.a=r},function(e,t,n){function r(e){e=a.a.bind()(o(),e),c.a.call(this,e),this.barSpaceRatio=[1,1],e.normalizeBarSpaceWidth&&(this.SINGLE_CODE_ERROR=.38,this.AVG_CODE_ERROR=.09)}function o(){var e={};return Object.keys(r.CONFIG_KEYS).forEach(function(t){e[t]=r.CONFIG_KEYS[t]["default"]}),e}var i=n(17),a=i&&i.__esModule?function(){return i["default"]}:function(){return i};Object.defineProperty(a,"a",{get:a});var c=n(6),s=1,u=3,d={START_PATTERN:{value:[s,s,s,s]},STOP_PATTERN:{value:[s,s,u]},CODE_PATTERN:{value:[[s,s,u,u,s],[u,s,s,s,u],[s,u,s,s,u],[u,u,s,s,s],[s,s,u,s,u],[u,s,u,s,s],[s,u,u,s,s],[s,s,s,u,u],[u,s,s,u,s],[s,u,s,u,s]]},SINGLE_CODE_ERROR:{value:.78,writable:!0},AVG_CODE_ERROR:{value:.38,writable:!0},MAX_CORRECTION_FACTOR:{value:5},FORMAT:{value:"i2of5"}};r.prototype=Object.create(c.a.prototype,d),r.prototype.constructor=r,r.prototype._matchPattern=function(e,t){if(this.config.normalizeBarSpaceWidth){var n,r=[0,0],o=[0,0],i=[0,0],a=this.MAX_CORRECTION_FACTOR,s=1/a;for(n=0;n<e.length;n++)r[n%2]+=e[n],o[n%2]+=t[n];for(i[0]=o[0]/r[0],i[1]=o[1]/r[1],i[0]=Math.max(Math.min(i[0],a),s),i[1]=Math.max(Math.min(i[1],a),s),this.barSpaceRatio=i,n=0;n<e.length;n++)e[n]*=this.barSpaceRatio[n%2]}return c.a.prototype._matchPattern.call(this,e,t)},r.prototype._findPattern=function(e,t,n,r){var o,i,a,c,s=[],u=this,d=0,f={error:Number.MAX_VALUE,code:-1,start:0,end:0},l=u.AVG_CODE_ERROR;for(n=n||!1,r=r||!1,t||(t=u._nextSet(u._row)),o=0;o<e.length;o++)s[o]=0;for(o=t;o<u._row.length;o++)if(u._row[o]^n)s[d]++;else{if(d===s.length-1){for(c=0,a=0;a<s.length;a++)c+=s[a];if(i=u._matchPattern(s,e),l>i)return f.error=i,f.start=o-c,f.end=o,f;if(!r)return null;for(a=0;a<s.length-2;a++)s[a]=s[a+2];s[s.length-2]=0,s[s.length-1]=0,d--}else d++;s[d]=1,n=!n}return null},r.prototype._findStart=function(){for(var e,t,n=this,r=n._nextSet(n._row),o=1;!t;){if(t=n._findPattern(n.START_PATTERN,r,!1,!0),!t)return null;if(o=Math.floor((t.end-t.start)/4),e=t.start-10*o,e>=0&&n._matchRange(e,t.start,0))return t;r=t.end,t=null}},r.prototype._verifyTrailingWhitespace=function(e){var t,n=this;return t=e.end+(e.end-e.start)/2,t<n._row.length&&n._matchRange(e.end,t,0)?e:null},r.prototype._findEnd=function(){var e,t,n=this;return n._row.reverse(),e=n._findPattern(n.STOP_PATTERN),n._row.reverse(),null===e?null:(t=e.start,e.start=n._row.length-e.end,e.end=n._row.length-t,null!==e?n._verifyTrailingWhitespace(e):null)},r.prototype._decodePair=function(e){var t,n,r=[],o=this;for(t=0;t<e.length;t++){if(n=o._decodeCode(e[t]),!n)return null;r.push(n)}return r},r.prototype._decodeCode=function(e){var t,n,r,o=this,i=0,a=o.AVG_CODE_ERROR,c={error:Number.MAX_VALUE,code:-1,start:0,end:0};for(t=0;t<e.length;t++)i+=e[t];for(r=0;r<o.CODE_PATTERN.length;r++)n=o._matchPattern(e,o.CODE_PATTERN[r]),n<c.error&&(c.code=r,c.error=n);return c.error<a?c:void 0},r.prototype._decodePayload=function(e,t,n){for(var r,o,i=this,a=0,c=e.length,s=[[0,0,0,0,0],[0,0,0,0,0]];c>a;){for(r=0;5>r;r++)s[0][r]=e[a]*this.barSpaceRatio[0],s[1][r]=e[a+1]*this.barSpaceRatio[1],a+=2;if(o=i._decodePair(s),!o)return null;for(r=0;r<o.length;r++)t.push(o[r].code+""),n.push(o[r])}return o},r.prototype._verifyCounterLength=function(e){return e.length%10===0},r.prototype._decode=function(){var e,t,n,r,o=this,i=[],a=[];return(e=o._findStart())?(a.push(e),(t=o._findEnd())?(r=o._fillCounters(e.end,t.start,!1),o._verifyCounterLength(r)&&(n=o._decodePayload(r,i,a))?i.length%2!==0||i.length<6?null:(a.push(t),{code:i.join(""),start:e.start,end:t.end,startInfo:e,decodedCodes:a}):null):null):null},r.CONFIG_KEYS={normalizeBarSpaceWidth:{type:"boolean","default":!1,description:"If true, the reader tries to normalize thewidth-difference between bars and spaces"}},t.a=r},function(e,t,n){function r(e,t){o.a.call(this,e,t)}var o=n(3),i={CODE_FREQUENCY:{value:[[56,52,50,49,44,38,35,42,41,37],[7,11,13,14,19,25,28,21,22,26]]},STOP_PATTERN:{value:[1/6*7,1/6*7,1/6*7,1/6*7,1/6*7,1/6*7]},FORMAT:{value:"upc_e",writeable:!1}};r.prototype=Object.create(o.a.prototype,i),r.prototype.constructor=r,r.prototype._decodePayload=function(e,t,n){var r,o=this,i=0;for(r=0;6>r;r++){if(e=o._decodeCode(e.end),!e)return null;e.code>=o.CODE_G_START&&(e.code=e.code-o.CODE_G_START,i|=1<<5-r),t.push(e.code),n.push(e)}return o._determineParity(i,t)?e:null},r.prototype._determineParity=function(e,t){var n,r;for(r=0;r<this.CODE_FREQUENCY.length;r++)for(n=0;n<this.CODE_FREQUENCY[r].length;n++)if(e===this.CODE_FREQUENCY[r][n])return t.unshift(r),t.push(n),!0;return!1},r.prototype._convertToUPCA=function(e){var t=[e[0]],n=e[e.length-2];return t=2>=n?t.concat(e.slice(1,3)).concat([n,0,0,0,0]).concat(e.slice(3,6)):3===n?t.concat(e.slice(1,4)).concat([0,0,0,0,0]).concat(e.slice(4,6)):4===n?t.concat(e.slice(1,5)).concat([0,0,0,0,0,e[5]]):t.concat(e.slice(1,6)).concat([0,0,0,0,n]),t.push(e[e.length-1]),t},r.prototype._checksum=function(e){return o.a.prototype._checksum.call(this,this._convertToUPCA(e))},r.prototype._findEnd=function(e,t){return t=!0,o.a.prototype._findEnd.call(this,e,t)},r.prototype._verifyTrailingWhitespace=function(e){var t,n=this;return t=e.end+(e.end-e.start)/2,t<n._row.length&&n._matchRange(e.end,t,0)?e:void 0},t.a=r},function(e,t,n){function r(e,t){o.a.call(this,e,t)}var o=n(3),i={FORMAT:{value:"upc_a",writeable:!1}};r.prototype=Object.create(o.a.prototype,i),r.prototype.constructor=r,r.prototype._decode=function(){var e=o.a.prototype._decode.call(this);return e&&e.code&&13===e.code.length&&"0"===e.code.charAt(0)?(e.code=e.code.substring(1),e):null},t.a=r},function(e,t,n){function r(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e}e.e=r},function(e,t,n){function r(){var e=new Float32Array(4);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e}e.e=r},function(e,t,n){function r(e,t){var n=t[0],r=t[1],o=t[2],i=t[3],a=n*i-o*r;return a?(a=1/a,e[0]=i*a,e[1]=-r*a,e[2]=-o*a,e[3]=n*a,e):null}e.e=r},function(e,t,n){function r(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e}e.e=r},function(e,t,n){function r(e,t,n){var r=t[0],o=t[1];return e[0]=n[0]*r+n[2]*o,e[1]=n[1]*r+n[3]*o,e}e.e=r},function(e,t,n){function r(e){var t=new Float32Array(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}e.e=r},function(e,t,n){function r(){}var o=n(14),i=Object.prototype;r.prototype=o?o(null):i,e.e=r},function(e,t,n){function r(e){var t=-1,n=e?e.length:0;for(this.clear();++t<n;){var r=e[t];this.set(r[0],r[1])}}var o=n(128),i=n(129),a=n(130),c=n(131),s=n(132);r.prototype.clear=o,r.prototype["delete"]=i,r.prototype.get=a,r.prototype.has=c,r.prototype.set=s,e.e=r},function(e,t,n){var r=n(1),o=r.Reflect;e.e=o},function(e,t,n){var r=n(12),o=n(1),i=r(o,"Set");e.e=i},function(e,t,n){var r=n(1),o=r.Symbol;e.e=o},function(e,t,n){var r=n(1),o=r.Uint8Array;e.e=o},function(e,t,n){var r=n(12),o=n(1),i=r(o,"WeakMap");e.e=i},function(e,t,n){function r(e,t){return e.set(t[0],t[1]),e}e.e=r},function(e,t,n){function r(e,t){return e.add(t),e}e.e=r},function(e,t,n){function r(e,t,n){var r=n.length;switch(r){case 0:return e.call(t);case 1:return e.call(t,n[0]);case 2:return e.call(t,n[0],n[1]);case 3:return e.call(t,n[0],n[1],n[2])}return e.apply(t,n)}e.e=r},function(e,t,n){function r(e,t){for(var n=-1,r=t.length,o=e.length;++n<r;)e[o+n]=t[n];return e}e.e=r},function(e,t,n){function r(e,t){return e&&o(t,i(t),e)}var o=n(21),i=n(45);e.e=r},function(e,t,n){function r(e,t,n,w,C,E,T){var O;if(w&&(O=E?w(e,C,E,T):w(e)),void 0!==O)return O;if(!b(e))return e;var x=m(e);if(x){if(O=p(e),!t)return d(e,O)}else{var P=l(e),A=P==R||P==S;if(g(e))return u(e,t);if(P==D||P==_||A&&!E){if(y(e))return E?e:{};if(O=v(A?{}:e),!t)return O=c(O,e),n?f(e,O):O}else{if(!H[P])return E?e:{};O=h(e,P,t)}}T||(T=new o);var M=T.get(e);return M?M:(T.set(e,O),(x?i:s)(e,function(o,i){a(O,i,r(o,t,n,w,i,e,T))}),n&&!x?f(e,O):O)}var o=n(32),i=n(33),a=n(35),c=n(92),s=n(97),u=n(107),d=n(41),f=n(114),l=n(119),p=n(123),h=n(124),v=n(125),m=n(5),g=n(141),y=n(22),b=n(2),_="[object Arguments]",w="[object Array]",C="[object Boolean]",E="[object Date]",T="[object Error]",R="[object Function]",S="[object GeneratorFunction]",O="[object Map]",x="[object Number]",D="[object Object]",P="[object RegExp]",A="[object Set]",M="[object String]",j="[object Symbol]",I="[object WeakMap]",k="[object ArrayBuffer]",N="[object Float32Array]",L="[object Float64Array]",z="[object Int8Array]",U="[object Int16Array]",F="[object Int32Array]",G="[object Uint8Array]",B="[object Uint8ClampedArray]",W="[object Uint16Array]",V="[object Uint32Array]",H={};H[_]=H[w]=H[k]=H[C]=H[E]=H[N]=H[L]=H[z]=H[U]=H[F]=H[O]=H[x]=H[D]=H[P]=H[A]=H[M]=H[j]=H[G]=H[B]=H[W]=H[V]=!0,H[T]=H[R]=H[I]=!1,e.e=r},function(e,t,n){function r(e){return o(e)?i(e):{}}var o=n(2),i=Object.create;e.e=r},function(e,t,n){function r(e,t,n,s){s||(s=[]);for(var u=-1,d=e.length;++u<d;){var f=e[u];t>0&&c(f)&&(n||a(f)||i(f))?t>1?r(f,t-1,n,s):o(s,f):n||(s[s.length]=f)}return s}var o=n(91),i=n(25),a=n(5),c=n(27);e.e=r},function(e,t,n){var r=n(116),o=r();e.e=o},function(e,t,n){function r(e,t){return e&&o(e,t,i)}var o=n(96),i=n(45);e.e=r},function(e,t,n){function r(e,t){return i.call(e,t)||"object"==typeof e&&t in e&&null===a(e)}var o=Object.prototype,i=o.hasOwnProperty,a=Object.getPrototypeOf;e.e=r},function(e,t,n){function r(e){return o(Object(e))}var o=Object.keys;e.e=r},function(e,t,n){function r(e){e=null==e?e:Object(e);var t=[];for(var n in e)t.push(n);return t}var o=n(83),i=n(127),a=Object.prototype,c=o?o.enumerate:void 0,s=a.propertyIsEnumerable;c&&!s.call({valueOf:1},"valueOf")&&(r=function(e){return i(c(e))}),e.e=r},function(e,t,n){function r(e,t,n,l,p){if(e!==t){var h=s(t)||d(t)?void 0:f(t);i(h||t,function(i,s){if(h&&(s=i,i=t[s]),u(i))p||(p=new o),c(e,t,s,n,r,l,p);else{var d=l?l(e[s],i,s+"",e,t,p):void 0;void 0===d&&(d=i),a(e,s,d)}})}}var o=n(32),i=n(33),a=n(34),c=n(102),s=n(5),u=n(2),d=n(44),f=n(46);e.e=r},function(e,t,n){function r(e,t,n,r,v,m,g){var y=e[n],b=t[n],_=g.get(b);if(_)return void o(e,n,_);var w=m?m(y,b,n+"",e,t,g):void 0,C=void 0===w;C&&(w=b,s(b)||p(b)?s(y)?w=y:u(y)?w=a(y):(C=!1,w=i(b,!m)):l(b)||c(b)?c(y)?w=h(y):!f(y)||r&&d(y)?(C=!1,w=i(b,!m)):w=y:C=!1),g.set(b,w),C&&v(w,b,r,m,g),g["delete"](b),o(e,n,w)}var o=n(34),i=n(93),a=n(41),c=n(25),s=n(5),u=n(27),d=n(16),f=n(2),l=n(143),p=n(44),h=n(148);e.e=r},function(e,t,n){function r(e,t){return e=Object(e),o(t,function(t,n){return n in e&&(t[n]=e[n]),t},{})}var o=n(20);e.e=r},function(e,t,n){function r(e){return function(t){return null==t?void 0:t[e]}}e.e=r},function(e,t,n){function r(e,t){for(var n=-1,r=Array(e);++n<e;)r[n]=t(n);return r}e.e=r},function(e,t,n){function r(e){return e&&e.Object===Object?e:null}e.e=r},function(e,t,n){function r(e,t){if(t)return e.slice();var n=new e.constructor(e.length);return e.copy(n),n}e.e=r},function(e,t,n){function r(e){return i(a(e),o,new e.constructor)}var o=n(88),i=n(20),a=n(133);e.e=r},function(e,t,n){function r(e){var t=new e.constructor(e.source,o.exec(e));return t.lastIndex=e.lastIndex,t}var o=/\w*$/;e.e=r},function(e,t,n){function r(e){return i(a(e),o,new e.constructor)}var o=n(89),i=n(20),a=n(134);e.e=r},function(e,t,n){function r(e){return a?Object(a.call(e)):{}}var o=n(85),i=o?o.prototype:void 0,a=i?i.valueOf:void 0;e.e=r},function(e,t,n){function r(e,t){var n=t?o(e.buffer):e.buffer;return new e.constructor(n,e.byteOffset,e.length)}var o=n(40);e.e=r},function(e,t,n){function r(e,t,n,r){n||(n={});for(var i=-1,a=t.length;++i<a;){var c=t[i],s=r?r(n[c],e[c],c,n,e):e[c];o(n,c,s)}return n}var o=n(35);e.e=r},function(e,t,n){function r(e,t){return o(e,i(e),t)}var o=n(21),i=n(118);e.e=r},function(e,t,n){function r(e){return i(function(t,n){var r=-1,i=n.length,a=i>1?n[i-1]:void 0,c=i>2?n[2]:void 0;for(a="function"==typeof a?(i--,a):void 0,c&&o(n[0],n[1],c)&&(a=3>i?void 0:a,i=1),t=Object(t);++r<i;){var s=n[r];s&&e(t,s,r,a)}return t})}var o=n(126),i=n(47);e.e=r},function(e,t,n){function r(e){return function(t,n,r){for(var o=-1,i=Object(t),a=r(t),c=a.length;c--;){var s=a[e?c:++o];if(n(i[s],s,i)===!1)break}return t}}e.e=r},function(e,t,n){var r=n(104),o=r("length");e.e=o},function(e,t,n){var r=Object.getOwnPropertySymbols,o=r||function(){return[]};e.e=o},function(e,t,n){function r(e){return p.call(e)}var o=n(4),i=n(84),a=n(87),c="[object Map]",s="[object Object]",u="[object Set]",d="[object WeakMap]",f=Object.prototype,l=Function.prototype.toString,p=f.toString,h=o?l.call(o):"",v=i?l.call(i):"",m=a?l.call(a):"";(o&&r(new o)!=c||i&&r(new i)!=u||a&&r(new a)!=d)&&(r=function(e){var t=p.call(e),n=t==s?e.constructor:null,r="function"==typeof n?l.call(n):"";if(r)switch(r){case h:return c;case v:return u;case m:return d}return t}),e.e=r},function(e,t,n){function r(e,t){return o(e,t)&&delete e[t]}var o=n(42);e.e=r},function(e,t,n){function r(e,t){if(o){var n=e[t];return n===i?void 0:n}return c.call(e,t)?e[t]:void 0}var o=n(14),i="__lodash_hash_undefined__",a=Object.prototype,c=a.hasOwnProperty;e.e=r},function(e,t,n){function r(e,t,n){e[t]=o&&void 0===n?i:n}var o=n(14),i="__lodash_hash_undefined__";e.e=r},function(e,t,n){function r(e){var t=e.length,n=e.constructor(t);return t&&"string"==typeof e[0]&&i.call(e,"index")&&(n.index=e.index,n.input=e.input),n}var o=Object.prototype,i=o.hasOwnProperty;e.e=r},function(e,t,n){function r(e,t,n){var r=e.constructor;switch(t){case y:return o(e);case d:case f:return new r(+e);case b:case _:case w:case C:case E:case T:case R:case S:case O:return u(e,n);case l:return i(e);case p:case m:return new r(e);case h:return a(e);case v:return c(e);case g:return s(e)}}var o=n(40),i=n(108),a=n(109),c=n(110),s=n(111),u=n(112),d="[object Boolean]",f="[object Date]",l="[object Map]",p="[object Number]",h="[object RegExp]",v="[object Set]",m="[object String]",g="[object Symbol]",y="[object ArrayBuffer]",b="[object Float32Array]",_="[object Float64Array]",w="[object Int8Array]",C="[object Int16Array]",E="[object Int32Array]",T="[object Uint8Array]",R="[object Uint8ClampedArray]",S="[object Uint16Array]",O="[object Uint32Array]";e.e=r},function(e,t,n){function r(e){return"function"!=typeof e.constructor||i(e)?{}:o(a(e))}var o=n(94),i=n(24),a=Object.getPrototypeOf;e.e=r},function(e,t,n){function r(e,t,n){if(!c(n))return!1;var r=typeof t;return("number"==r?i(n)&&a(t,n.length):"string"==r&&t in n)?o(n[t],e):!1}var o=n(15),i=n(26),a=n(23),c=n(2);e.e=r},function(e,t,n){function r(e){for(var t,n=[];!(t=e.next()).done;)n.push(t.value);return n}e.e=r},function(e,t,n){function r(){this.__data__={hash:new o,map:i?new i:[],string:new o}}var o=n(81),i=n(4);e.e=r},function(e,t,n){function r(e){var t=this.__data__;return c(e)?a("string"==typeof e?t.string:t.hash,e):o?t.map["delete"](e):i(t.map,e)}var o=n(4),i=n(36),a=n(120),c=n(13);e.e=r},function(e,t,n){function r(e){var t=this.__data__;return c(e)?a("string"==typeof e?t.string:t.hash,e):o?t.map.get(e):i(t.map,e)}var o=n(4),i=n(37),a=n(121),c=n(13);e.e=r},function(e,t,n){function r(e){var t=this.__data__;return c(e)?a("string"==typeof e?t.string:t.hash,e):o?t.map.has(e):i(t.map,e)}var o=n(4),i=n(38),a=n(42),c=n(13);e.e=r},function(e,t,n){function r(e,t){var n=this.__data__;return c(e)?a("string"==typeof e?n.string:n.hash,e,t):o?n.map.set(e,t):i(n.map,e,t),this}var o=n(4),i=n(39),a=n(122),c=n(13);e.e=r},function(e,t,n){function r(e){var t=-1,n=Array(e.size);return e.forEach(function(e,r){n[++t]=[r,e]}),n}e.e=r},function(e,t,n){function r(e){var t=-1,n=Array(e.size);return e.forEach(function(e){n[++t]=e}),n}e.e=r},function(e,t,n){function r(){this.__data__={array:[],map:null}}e.e=r},function(e,t,n){function r(e){var t=this.__data__,n=t.array;return n?o(n,e):t.map["delete"](e)}var o=n(36);e.e=r},function(e,t,n){function r(e){var t=this.__data__,n=t.array;return n?o(n,e):t.map.get(e)}var o=n(37);e.e=r},function(e,t,n){function r(e){var t=this.__data__,n=t.array;return n?o(n,e):t.map.has(e)}var o=n(38);e.e=r},function(e,t,n){function r(e,t){var n=this.__data__,r=n.array;r&&(r.length<a-1?i(r,e,t):(n.array=null,n.map=new o(r)));var c=n.map;return c&&c.set(e,t),this}var o=n(82),i=n(39),a=200;e.e=r},function(e,t,n){function r(e){return function(){return e}}e.e=r},function(e,t,n){(function(e){var r=n(140),o=n(1),i={"function":!0,object:!0},a=i[typeof t]&&t&&!t.nodeType?t:void 0,c=i[typeof e]&&e&&!e.nodeType?e:void 0,s=c&&c.exports===a?a:void 0,u=s?o.Buffer:void 0,d=u?function(e){return e instanceof u}:r(!1);e.e=d}).call(t,n(48)(e))},function(e,t,n){function r(e){return null==e?!1:o(e)?l.test(d.call(e)):a(e)&&(i(e)?l:s).test(e)}var o=n(16),i=n(22),a=n(8),c=/[\\^$.*+?()[\]{}|]/g,s=/^\[object .+?Constructor\]$/,u=Object.prototype,d=Function.prototype.toString,f=u.hasOwnProperty,l=RegExp("^"+d.call(f).replace(c,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");e.e=r},function(e,t,n){function r(e){if(!i(e)||d.call(e)!=a||o(e))return!1;var t=f(e);if(null===t)return!0;var n=t.constructor;return"function"==typeof n&&n instanceof n&&s.call(n)==u}var o=n(22),i=n(8),a="[object Object]",c=Object.prototype,s=Function.prototype.toString,u=s.call(Object),d=c.toString,f=Object.getPrototypeOf;e.e=r},function(e,t,n){function r(e){return"string"==typeof e||!o(e)&&i(e)&&s.call(e)==a}var o=n(5),i=n(8),a="[object String]",c=Object.prototype,s=c.toString;e.e=r},function(e,t,n){var r=n(95),o=n(103),i=n(47),a=i(function(e,t){return null==e?{}:o(e,r(t,1))});e.e=a},function(e,t,n){function r(e){if(!e)return 0===e?e:0;if(e=o(e),e===i||e===-i){var t=0>e?-1:1;return t*a}var n=e%1;return e===e?n?e-n:e:0}var o=n(147),i=1/0,a=1.7976931348623157e308;e.e=r},function(e,t,n){function r(e){if(i(e)){var t=o(e.valueOf)?e.valueOf():e;e=i(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(c,"");var n=u.test(e);return n||d.test(e)?f(e.slice(2),n?2:8):s.test(e)?a:+e}var o=n(16),i=n(2),a=NaN,c=/^\s+|\s+$/g,s=/^[-+]0x[0-9a-f]+$/i,u=/^0b[01]+$/i,d=/^0o[0-7]+$/i,f=parseInt;e.e=r},function(e,t,n){function r(e){return o(e,i(e))}var o=n(21),i=n(46);e.e=r},function(e,t,n){"use strict";var r={};r.generateIdentifier=function(){return Math.random().toString(36).substr(2,10)},r.localCName=r.generateIdentifier(),r.splitLines=function(e){return e.trim().split("\n").map(function(e){return e.trim()})},r.splitSections=function(e){var t=e.split("\nm=");return t.map(function(e,t){return(t>0?"m="+e:e).trim()+"\r\n"})},r.matchPrefix=function(e,t){return r.splitLines(e).filter(function(e){return 0===e.indexOf(t)})},r.parseCandidate=function(e){var t;t=0===e.indexOf("a=candidate:")?e.substring(12).split(" "):e.substring(10).split(" ");for(var n={foundation:t[0],component:t[1],protocol:t[2].toLowerCase(),priority:parseInt(t[3],10),ip:t[4],port:parseInt(t[5],10),type:t[7]},r=8;r<t.length;r+=2)switch(t[r]){case"raddr":n.relatedAddress=t[r+1];break;case"rport":n.relatedPort=parseInt(t[r+1],10);break;case"tcptype":n.tcpType=t[r+1]}return n},r.writeCandidate=function(e){var t=[];t.push(e.foundation),t.push(e.component),t.push(e.protocol.toUpperCase()),t.push(e.priority),t.push(e.ip),t.push(e.port);var n=e.type;return t.push("typ"),t.push(n),"host"!==n&&e.relatedAddress&&e.relatedPort&&(t.push("raddr"),t.push(e.relatedAddress),t.push("rport"),t.push(e.relatedPort)),e.tcpType&&"tcp"===e.protocol.toLowerCase()&&(t.push("tcptype"),t.push(e.tcpType)),"candidate:"+t.join(" ")},r.parseRtpMap=function(e){var t=e.substr(9).split(" "),n={payloadType:parseInt(t.shift(),10)};return t=t[0].split("/"),n.name=t[0],n.clockRate=parseInt(t[1],10),n.numChannels=3===t.length?parseInt(t[2],10):1,n},r.writeRtpMap=function(e){var t=e.payloadType;return void 0!==e.preferredPayloadType&&(t=e.preferredPayloadType),"a=rtpmap:"+t+" "+e.name+"/"+e.clockRate+(1!==e.numChannels?"/"+e.numChannels:"")+"\r\n"},r.parseExtmap=function(e){var t=e.substr(9).split(" ");return{id:parseInt(t[0],10),uri:t[1]}},r.writeExtmap=function(e){return"a=extmap:"+(e.id||e.preferredId)+" "+e.uri+"\r\n"},r.parseFmtp=function(e){for(var t,n={},r=e.substr(e.indexOf(" ")+1).split(";"),o=0;o<r.length;o++)t=r[o].trim().split("="),n[t[0].trim()]=t[1];return n},r.writeFmtp=function(e){var t="",n=e.payloadType;if(void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.parameters&&Object.keys(e.parameters).length){var r=[];Object.keys(e.parameters).forEach(function(t){r.push(t+"="+e.parameters[t])}),t+="a=fmtp:"+n+" "+r.join(";")+"\r\n"}return t},r.parseRtcpFb=function(e){var t=e.substr(e.indexOf(" ")+1).split(" ");return{type:t.shift(),parameter:t.join(" ")}},r.writeRtcpFb=function(e){var t="",n=e.payloadType;return void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.rtcpFeedback&&e.rtcpFeedback.length&&e.rtcpFeedback.forEach(function(e){t+="a=rtcp-fb:"+n+" "+e.type+(e.parameter&&e.parameter.length?" "+e.parameter:"")+"\r\n"}),t},r.parseSsrcMedia=function(e){var t=e.indexOf(" "),n={ssrc:parseInt(e.substr(7,t-7),10)},r=e.indexOf(":",t);return r>-1?(n.attribute=e.substr(t+1,r-t-1),n.value=e.substr(r+1)):n.attribute=e.substr(t+1),
	n},r.getDtlsParameters=function(e,t){var n=r.splitLines(e);n=n.concat(r.splitLines(t));var o=n.filter(function(e){return 0===e.indexOf("a=fingerprint:")})[0].substr(14),i={role:"auto",fingerprints:[{algorithm:o.split(" ")[0],value:o.split(" ")[1]}]};return i},r.writeDtlsParameters=function(e,t){var n="a=setup:"+t+"\r\n";return e.fingerprints.forEach(function(e){n+="a=fingerprint:"+e.algorithm+" "+e.value+"\r\n"}),n},r.getIceParameters=function(e,t){var n=r.splitLines(e);n=n.concat(r.splitLines(t));var o={usernameFragment:n.filter(function(e){return 0===e.indexOf("a=ice-ufrag:")})[0].substr(12),password:n.filter(function(e){return 0===e.indexOf("a=ice-pwd:")})[0].substr(10)};return o},r.writeIceParameters=function(e){return"a=ice-ufrag:"+e.usernameFragment+"\r\na=ice-pwd:"+e.password+"\r\n"},r.parseRtpParameters=function(e){for(var t={codecs:[],headerExtensions:[],fecMechanisms:[],rtcp:[]},n=r.splitLines(e),o=n[0].split(" "),i=3;i<o.length;i++){var a=o[i],c=r.matchPrefix(e,"a=rtpmap:"+a+" ")[0];if(c){var s=r.parseRtpMap(c),u=r.matchPrefix(e,"a=fmtp:"+a+" ");switch(s.parameters=u.length?r.parseFmtp(u[0]):{},s.rtcpFeedback=r.matchPrefix(e,"a=rtcp-fb:"+a+" ").map(r.parseRtcpFb),t.codecs.push(s),s.name.toUpperCase()){case"RED":case"ULPFEC":t.fecMechanisms.push(s.name.toUpperCase())}}}return r.matchPrefix(e,"a=extmap:").forEach(function(e){t.headerExtensions.push(r.parseExtmap(e))}),t},r.writeRtpDescription=function(e,t){var n="";return n+="m="+e+" ",n+=t.codecs.length>0?"9":"0",n+=" UDP/TLS/RTP/SAVPF ",n+=t.codecs.map(function(e){return void 0!==e.preferredPayloadType?e.preferredPayloadType:e.payloadType}).join(" ")+"\r\n",n+="c=IN IP4 0.0.0.0\r\n",n+="a=rtcp:9 IN IP4 0.0.0.0\r\n",t.codecs.forEach(function(e){n+=r.writeRtpMap(e),n+=r.writeFmtp(e),n+=r.writeRtcpFb(e)}),n+="a=rtcp-mux\r\n"},r.parseRtpEncodingParameters=function(e){var t,n=[],o=r.parseRtpParameters(e),i=-1!==o.fecMechanisms.indexOf("RED"),a=-1!==o.fecMechanisms.indexOf("ULPFEC"),c=r.matchPrefix(e,"a=ssrc:").map(function(e){return r.parseSsrcMedia(e)}).filter(function(e){return"cname"===e.attribute}),s=c.length>0&&c[0].ssrc,u=r.matchPrefix(e,"a=ssrc-group:FID").map(function(e){var t=e.split(" ");return t.shift(),t.map(function(e){return parseInt(e,10)})});u.length>0&&u[0].length>1&&u[0][0]===s&&(t=u[0][1]),o.codecs.forEach(function(e){if("RTX"===e.name.toUpperCase()&&e.parameters.apt){var r={ssrc:s,codecPayloadType:parseInt(e.parameters.apt,10),rtx:{payloadType:e.payloadType,ssrc:t}};n.push(r),i&&(r=JSON.parse(JSON.stringify(r)),r.fec={ssrc:t,mechanism:a?"red+ulpfec":"red"},n.push(r))}}),0===n.length&&s&&n.push({ssrc:s});var d=r.matchPrefix(e,"b=");return d.length&&(0===d[0].indexOf("b=TIAS:")?d=parseInt(d[0].substr(7),10):0===d[0].indexOf("b=AS:")&&(d=parseInt(d[0].substr(5),10)),n.forEach(function(e){e.maxBitrate=d})),n},r.writeSessionBoilerplate=function(){return"v=0\r\no=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"},r.writeMediaSection=function(e,t,n,o){var i=r.writeRtpDescription(e.kind,t);if(i+=r.writeIceParameters(e.iceGatherer.getLocalParameters()),i+=r.writeDtlsParameters(e.dtlsTransport.getLocalParameters(),"offer"===n?"actpass":"active"),i+="a=mid:"+e.mid+"\r\n",i+=e.rtpSender&&e.rtpReceiver?"a=sendrecv\r\n":e.rtpSender?"a=sendonly\r\n":e.rtpReceiver?"a=recvonly\r\n":"a=inactive\r\n",e.rtpSender){var a="msid:"+o.id+" "+e.rtpSender.track.id+"\r\n";i+="a="+a,i+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" "+a}return i+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" cname:"+r.localCName+"\r\n"},r.getDirection=function(e,t){for(var n=r.splitLines(e),o=0;o<n.length;o++)switch(n[o]){case"a=sendrecv":case"a=sendonly":case"a=recvonly":case"a=inactive":return n[o].substr(2)}return t?r.getDirection(t):"sendrecv"},e.e=r},function(e,t,n){"use strict";!function(){var t=n(0).log,r=n(0).browserDetails;e.e.browserDetails=r,e.e.extractVersion=n(0).extractVersion,e.e.disableLog=n(0).disableLog;var o=n(151)||null,i=n(153)||null,a=n(155)||null,c=n(157)||null;switch(r.browser){case"opera":case"chrome":if(!o||!o.shimPeerConnection)return void t("Chrome shim is not included in this adapter release.");t("adapter.js shimming chrome."),e.e.browserShim=o,o.shimGetUserMedia(),o.shimMediaStream(),o.shimSourceObject(),o.shimPeerConnection(),o.shimOnTrack();break;case"firefox":if(!a||!a.shimPeerConnection)return void t("Firefox shim is not included in this adapter release.");t("adapter.js shimming firefox."),e.e.browserShim=a,a.shimGetUserMedia(),a.shimSourceObject(),a.shimPeerConnection(),a.shimOnTrack();break;case"edge":if(!i||!i.shimPeerConnection)return void t("MS edge shim is not included in this adapter release.");t("adapter.js shimming edge."),e.e.browserShim=i,i.shimGetUserMedia(),i.shimPeerConnection();break;case"safari":if(!c)return void t("Safari shim is not included in this adapter release.");t("adapter.js shimming safari."),e.e.browserShim=c,c.shimGetUserMedia();break;default:t("Unsupported browser!")}}()},function(e,t,n){"use strict";var r=n(0).log,o=n(0).browserDetails,i={shimMediaStream:function(){window.MediaStream=window.MediaStream||window.webkitMediaStream},shimOnTrack:function(){"object"!=typeof window||!window.RTCPeerConnection||"ontrack"in window.RTCPeerConnection.prototype||Object.defineProperty(window.RTCPeerConnection.prototype,"ontrack",{get:function(){return this._ontrack},set:function(e){var t=this;this._ontrack&&(this.removeEventListener("track",this._ontrack),this.removeEventListener("addstream",this._ontrackpoly)),this.addEventListener("track",this._ontrack=e),this.addEventListener("addstream",this._ontrackpoly=function(e){e.stream.addEventListener("addtrack",function(n){var r=new Event("track");r.track=n.track,r.receiver={track:n.track},r.streams=[e.stream],t.dispatchEvent(r)}),e.stream.getTracks().forEach(function(t){var n=new Event("track");n.track=t,n.receiver={track:t},n.streams=[e.stream],this.dispatchEvent(n)}.bind(this))}.bind(this))}})},shimSourceObject:function(){"object"==typeof window&&(!window.HTMLMediaElement||"srcObject"in window.HTMLMediaElement.prototype||Object.defineProperty(window.HTMLMediaElement.prototype,"srcObject",{get:function(){return this._srcObject},set:function(e){var t=this;return this._srcObject=e,this.src&&URL.revokeObjectURL(this.src),e?(this.src=URL.createObjectURL(e),e.addEventListener("addtrack",function(){t.src&&URL.revokeObjectURL(t.src),t.src=URL.createObjectURL(e)}),void e.addEventListener("removetrack",function(){t.src&&URL.revokeObjectURL(t.src),t.src=URL.createObjectURL(e)})):void(this.src="")}}))},shimPeerConnection:function(){window.RTCPeerConnection=function(e,t){r("PeerConnection"),e&&e.iceTransportPolicy&&(e.iceTransports=e.iceTransportPolicy);var n=new webkitRTCPeerConnection(e,t),o=n.getStats.bind(n);return n.getStats=function(e,t,n){var r=this,i=arguments;if(arguments.length>0&&"function"==typeof e)return o(e,t);var a=function(e){var t={},n=e.result();return n.forEach(function(e){var n={id:e.id,timestamp:e.timestamp,type:e.type};e.names().forEach(function(t){n[t]=e.stat(t)}),t[n.id]=n}),t},c=function(e,t){var n=new Map(Object.keys(e).map(function(t){return[t,e[t]]}));return t=t||e,Object.keys(t).forEach(function(e){n[e]=t[e]}),n};if(arguments.length>=2){var s=function(e){i[1](c(a(e)))};return o.apply(this,[s,arguments[0]])}return new Promise(function(t,n){1===i.length&&"object"==typeof e?o.apply(r,[function(e){t(c(a(e)))},n]):o.apply(r,[function(e){t(c(a(e),e.result()))},n])}).then(t,n)},n},window.RTCPeerConnection.prototype=webkitRTCPeerConnection.prototype,webkitRTCPeerConnection.generateCertificate&&Object.defineProperty(window.RTCPeerConnection,"generateCertificate",{get:function(){return webkitRTCPeerConnection.generateCertificate}}),o.version<51&&(["createOffer","createAnswer"].forEach(function(e){var t=webkitRTCPeerConnection.prototype[e];webkitRTCPeerConnection.prototype[e]=function(){var e=this;if(arguments.length<1||1===arguments.length&&"object"==typeof arguments[0]){var n=1===arguments.length?arguments[0]:void 0;return new Promise(function(r,o){t.apply(e,[r,o,n])})}return t.apply(this,arguments)}}),["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach(function(e){var t=webkitRTCPeerConnection.prototype[e];webkitRTCPeerConnection.prototype[e]=function(){var e=arguments,n=this,r=new Promise(function(r,o){t.apply(n,[e[0],r,o])});return e.length<2?r:r.then(function(){e[1].apply(null,[])},function(t){e.length>=3&&e[2].apply(null,[t])})}}));var e=RTCPeerConnection.prototype.addIceCandidate;RTCPeerConnection.prototype.addIceCandidate=function(){return null===arguments[0]?Promise.resolve():e.apply(this,arguments)},["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach(function(e){var t=webkitRTCPeerConnection.prototype[e];webkitRTCPeerConnection.prototype[e]=function(){return arguments[0]=new("addIceCandidate"===e?RTCIceCandidate:RTCSessionDescription)(arguments[0]),t.apply(this,arguments)}})},attachMediaStream:function(e,t){r("DEPRECATED, attachMediaStream will soon be removed."),o.version>=43?e.srcObject=t:"undefined"!=typeof e.src?e.src=URL.createObjectURL(t):r("Error attaching stream to element.")},reattachMediaStream:function(e,t){r("DEPRECATED, reattachMediaStream will soon be removed."),o.version>=43?e.srcObject=t.srcObject:e.src=t.src}};e.e={shimMediaStream:i.shimMediaStream,shimOnTrack:i.shimOnTrack,shimSourceObject:i.shimSourceObject,shimPeerConnection:i.shimPeerConnection,shimGetUserMedia:n(152),attachMediaStream:i.attachMediaStream,reattachMediaStream:i.reattachMediaStream}},function(e,t,n){"use strict";var r=n(0).log;e.e=function(){var e=function(e){if("object"!=typeof e||e.mandatory||e.optional)return e;var t={};return Object.keys(e).forEach(function(n){if("require"!==n&&"advanced"!==n&&"mediaSource"!==n){var r="object"==typeof e[n]?e[n]:{ideal:e[n]};void 0!==r.exact&&"number"==typeof r.exact&&(r.min=r.max=r.exact);var o=function(e,t){return e?e+t.charAt(0).toUpperCase()+t.slice(1):"deviceId"===t?"sourceId":t};if(void 0!==r.ideal){t.optional=t.optional||[];var i={};"number"==typeof r.ideal?(i[o("min",n)]=r.ideal,t.optional.push(i),i={},i[o("max",n)]=r.ideal,t.optional.push(i)):(i[o("",n)]=r.ideal,t.optional.push(i))}void 0!==r.exact&&"number"!=typeof r.exact?(t.mandatory=t.mandatory||{},t.mandatory[o("",n)]=r.exact):["min","max"].forEach(function(e){void 0!==r[e]&&(t.mandatory=t.mandatory||{},t.mandatory[o(e,n)]=r[e])})}}),e.advanced&&(t.optional=(t.optional||[]).concat(e.advanced)),t},t=function(t,n){if(t=JSON.parse(JSON.stringify(t)),t&&t.audio&&(t.audio=e(t.audio)),t&&"object"==typeof t.video){var o=t.video.facingMode;if(o=o&&("object"==typeof o?o:{ideal:o}),o&&("user"===o.exact||"environment"===o.exact||"user"===o.ideal||"environment"===o.ideal)&&(!navigator.mediaDevices.getSupportedConstraints||!navigator.mediaDevices.getSupportedConstraints().facingMode)&&(delete t.video.facingMode,"environment"===o.exact||"environment"===o.ideal))return navigator.mediaDevices.enumerateDevices().then(function(i){i=i.filter(function(e){return"videoinput"===e.kind});var a=i.find(function(e){return-1!==e.label.toLowerCase().indexOf("back")})||i.length&&i[i.length-1];return a&&(t.video.deviceId=o.exact?{exact:a.deviceId}:{ideal:a.deviceId}),t.video=e(t.video),r("chrome: "+JSON.stringify(t)),n(t)});t.video=e(t.video)}return r("chrome: "+JSON.stringify(t)),n(t)},n=function(e){return{name:{PermissionDeniedError:"NotAllowedError",ConstraintNotSatisfiedError:"OverconstrainedError"}[e.name]||e.name,message:e.message,constraint:e.constraintName,toString:function(){return this.name+(this.message&&": ")+this.message}}},o=function(e,r,o){t(e,function(e){navigator.webkitGetUserMedia(e,r,function(e){o(n(e))})})};navigator.getUserMedia=o;var i=function(e){return new Promise(function(t,n){navigator.getUserMedia(e,t,n)})};if(navigator.mediaDevices||(navigator.mediaDevices={getUserMedia:i,enumerateDevices:function(){return new Promise(function(e){var t={audio:"audioinput",video:"videoinput"};return MediaStreamTrack.getSources(function(n){e(n.map(function(e){return{label:e.label,kind:t[e.kind],deviceId:e.id,groupId:""}}))})})}}),navigator.mediaDevices.getUserMedia){var a=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=function(e){return t(e,function(e){return a(e)["catch"](function(e){return Promise.reject(n(e))})})}}else navigator.mediaDevices.getUserMedia=function(e){return i(e)};"undefined"==typeof navigator.mediaDevices.addEventListener&&(navigator.mediaDevices.addEventListener=function(){r("Dummy mediaDevices.addEventListener called.")}),"undefined"==typeof navigator.mediaDevices.removeEventListener&&(navigator.mediaDevices.removeEventListener=function(){r("Dummy mediaDevices.removeEventListener called.")})}},function(e,t,n){"use strict";var r=n(149),o=n(0).log,i={shimPeerConnection:function(){window.RTCIceGatherer&&(window.RTCIceCandidate||(window.RTCIceCandidate=function(e){return e}),window.RTCSessionDescription||(window.RTCSessionDescription=function(e){return e})),window.RTCPeerConnection=function(e){var t=this,n=document.createDocumentFragment();if(["addEventListener","removeEventListener","dispatchEvent"].forEach(function(e){t[e]=n[e].bind(n)}),this.onicecandidate=null,this.onaddstream=null,this.ontrack=null,this.onremovestream=null,this.onsignalingstatechange=null,this.oniceconnectionstatechange=null,this.onnegotiationneeded=null,this.ondatachannel=null,this.localStreams=[],this.remoteStreams=[],this.getLocalStreams=function(){return t.localStreams},this.getRemoteStreams=function(){return t.remoteStreams},this.localDescription=new RTCSessionDescription({type:"",sdp:""}),this.remoteDescription=new RTCSessionDescription({type:"",sdp:""}),this.signalingState="stable",this.iceConnectionState="new",this.iceGatheringState="new",this.iceOptions={gatherPolicy:"all",iceServers:[]},e&&e.iceTransportPolicy)switch(e.iceTransportPolicy){case"all":case"relay":this.iceOptions.gatherPolicy=e.iceTransportPolicy;break;case"none":throw new TypeError('iceTransportPolicy "none" not supported')}e&&e.iceServers&&(this.iceOptions.iceServers=e.iceServers.filter(function(e){return e&&e.urls?(e.urls=e.urls.filter(function(e){return 0===e.indexOf("turn:")&&-1!==e.indexOf("transport=udp")})[0],!!e.urls):!1})),this.transceivers=[],this._localIceCandidatesBuffer=[]},window.RTCPeerConnection.prototype._emitBufferedCandidates=function(){var e=this,t=r.splitSections(e.localDescription.sdp);this._localIceCandidatesBuffer.forEach(function(n){var r=!n.candidate||0===Object.keys(n.candidate).length;if(r)for(var o=1;o<t.length;o++)-1===t[o].indexOf("\r\na=end-of-candidates\r\n")&&(t[o]+="a=end-of-candidates\r\n");else-1===n.candidate.candidate.indexOf("typ endOfCandidates")&&(t[n.candidate.sdpMLineIndex+1]+="a="+n.candidate.candidate+"\r\n");if(e.localDescription.sdp=t.join(""),e.dispatchEvent(n),null!==e.onicecandidate&&e.onicecandidate(n),!n.candidate&&"complete"!==e.iceGatheringState){var i=e.transceivers.every(function(e){return e.iceGatherer&&"completed"===e.iceGatherer.state});i&&(e.iceGatheringState="complete")}}),this._localIceCandidatesBuffer=[]},window.RTCPeerConnection.prototype.addStream=function(e){this.localStreams.push(e.clone()),this._maybeFireNegotiationNeeded()},window.RTCPeerConnection.prototype.removeStream=function(e){var t=this.localStreams.indexOf(e);t>-1&&(this.localStreams.splice(t,1),this._maybeFireNegotiationNeeded())},window.RTCPeerConnection.prototype.getSenders=function(){return this.transceivers.filter(function(e){return!!e.rtpSender}).map(function(e){return e.rtpSender})},window.RTCPeerConnection.prototype.getReceivers=function(){return this.transceivers.filter(function(e){return!!e.rtpReceiver}).map(function(e){return e.rtpReceiver})},window.RTCPeerConnection.prototype._getCommonCapabilities=function(e,t){var n={codecs:[],headerExtensions:[],fecMechanisms:[]};return e.codecs.forEach(function(e){for(var r=0;r<t.codecs.length;r++){var o=t.codecs[r];if(e.name.toLowerCase()===o.name.toLowerCase()&&e.clockRate===o.clockRate&&e.numChannels===o.numChannels){n.codecs.push(o);break}}}),e.headerExtensions.forEach(function(e){for(var r=0;r<t.headerExtensions.length;r++){var o=t.headerExtensions[r];if(e.uri===o.uri){n.headerExtensions.push(o);break}}}),n},window.RTCPeerConnection.prototype._createIceAndDtlsTransports=function(e,t){var n=this,o=new RTCIceGatherer(n.iceOptions),i=new RTCIceTransport(o);o.onlocalcandidate=function(a){var c=new Event("icecandidate");c.candidate={sdpMid:e,sdpMLineIndex:t};var s=a.candidate,u=!s||0===Object.keys(s).length;u?(void 0===o.state&&(o.state="completed"),c.candidate.candidate="candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates"):(s.component="RTCP"===i.component?2:1,c.candidate.candidate=r.writeCandidate(s));var d=n.transceivers.every(function(e){return e.iceGatherer&&"completed"===e.iceGatherer.state});switch(n.iceGatheringState){case"new":n._localIceCandidatesBuffer.push(c),u&&d&&n._localIceCandidatesBuffer.push(new Event("icecandidate"));break;case"gathering":n._emitBufferedCandidates(),n.dispatchEvent(c),null!==n.onicecandidate&&n.onicecandidate(c),d&&(n.dispatchEvent(new Event("icecandidate")),null!==n.onicecandidate&&n.onicecandidate(new Event("icecandidate")),n.iceGatheringState="complete");break;case"complete":}},i.onicestatechange=function(){n._updateConnectionState()};var a=new RTCDtlsTransport(i);return a.ondtlsstatechange=function(){n._updateConnectionState()},a.onerror=function(){a.state="failed",n._updateConnectionState()},{iceGatherer:o,iceTransport:i,dtlsTransport:a}},window.RTCPeerConnection.prototype._transceive=function(e,t,n){var o=this._getCommonCapabilities(e.localCapabilities,e.remoteCapabilities);t&&e.rtpSender&&(o.encodings=e.sendEncodingParameters,o.rtcp={cname:r.localCName},e.recvEncodingParameters.length&&(o.rtcp.ssrc=e.recvEncodingParameters[0].ssrc),e.rtpSender.send(o)),n&&e.rtpReceiver&&(o.encodings=e.recvEncodingParameters,o.rtcp={cname:e.cname},e.sendEncodingParameters.length&&(o.rtcp.ssrc=e.sendEncodingParameters[0].ssrc),e.rtpReceiver.receive(o))},window.RTCPeerConnection.prototype.setLocalDescription=function(e){var t,n,o=this;if("offer"===e.type)this._pendingOffer&&(t=r.splitSections(e.sdp),n=t.shift(),t.forEach(function(e,t){var n=r.parseRtpParameters(e);o._pendingOffer[t].localCapabilities=n}),this.transceivers=this._pendingOffer,delete this._pendingOffer);else if("answer"===e.type){t=r.splitSections(o.remoteDescription.sdp),n=t.shift();var i=r.matchPrefix(n,"a=ice-lite").length>0;t.forEach(function(e,t){var a=o.transceivers[t],c=a.iceGatherer,s=a.iceTransport,u=a.dtlsTransport,d=a.localCapabilities,f=a.remoteCapabilities,l="0"===e.split("\n",1)[0].split(" ",2)[1];if(!l){var p=r.getIceParameters(e,n);if(i){var h=r.matchPrefix(e,"a=candidate:").map(function(e){return r.parseCandidate(e)}).filter(function(e){return"1"===e.component});s.setRemoteCandidates(h)}s.start(c,p,i?"controlling":"controlled");var v=r.getDtlsParameters(e,n);i&&(v.role="server"),u.start(v);var m=o._getCommonCapabilities(d,f);o._transceive(a,m.codecs.length>0,!1)}})}switch(this.localDescription={type:e.type,sdp:e.sdp},e.type){case"offer":this._updateSignalingState("have-local-offer");break;case"answer":this._updateSignalingState("stable");break;default:throw new TypeError('unsupported type "'+e.type+'"')}var a=arguments.length>1&&"function"==typeof arguments[1];if(a){var c=arguments[1];window.setTimeout(function(){c(),"new"===o.iceGatheringState&&(o.iceGatheringState="gathering"),o._emitBufferedCandidates()},0)}var s=Promise.resolve();return s.then(function(){a||("new"===o.iceGatheringState&&(o.iceGatheringState="gathering"),window.setTimeout(o._emitBufferedCandidates.bind(o),500))}),s},window.RTCPeerConnection.prototype.setRemoteDescription=function(e){var t=this,n=new MediaStream,o=[],i=r.splitSections(e.sdp),a=i.shift(),c=r.matchPrefix(a,"a=ice-lite").length>0;switch(i.forEach(function(i,s){var u,d,f,l,p,h,v,m,g,y,b,_,w=r.splitLines(i),C=w[0].substr(2).split(" "),E=C[0],T="0"===C[1],R=r.getDirection(i,a),S=r.parseRtpParameters(i);T||(b=r.getIceParameters(i,a),_=r.getDtlsParameters(i,a),_.role="client"),m=r.parseRtpEncodingParameters(i);var O=r.matchPrefix(i,"a=mid:");O=O.length?O[0].substr(6):r.generateIdentifier();var x,D=r.matchPrefix(i,"a=ssrc:").map(function(e){return r.parseSsrcMedia(e)}).filter(function(e){return"cname"===e.attribute})[0];D&&(x=D.value);var P=r.matchPrefix(i,"a=end-of-candidates").length>0,A=r.matchPrefix(i,"a=candidate:").map(function(e){return r.parseCandidate(e)}).filter(function(e){return"1"===e.component});if("offer"!==e.type||T)"answer"!==e.type||T||(u=t.transceivers[s],d=u.iceGatherer,f=u.iceTransport,l=u.dtlsTransport,p=u.rtpSender,h=u.rtpReceiver,v=u.sendEncodingParameters,g=u.localCapabilities,t.transceivers[s].recvEncodingParameters=m,t.transceivers[s].remoteCapabilities=S,t.transceivers[s].cname=x,(c||P)&&f.setRemoteCandidates(A),f.start(d,b,"controlling"),l.start(_),t._transceive(u,"sendrecv"===R||"recvonly"===R,"sendrecv"===R||"sendonly"===R),!h||"sendrecv"!==R&&"sendonly"!==R?delete u.rtpReceiver:(y=h.track,o.push([y,h]),n.addTrack(y)));else{var M=t._createIceAndDtlsTransports(O,s);if(P&&M.iceTransport.setRemoteCandidates(A),g=RTCRtpReceiver.getCapabilities(E),v=[{ssrc:1001*(2*s+2)}],h=new RTCRtpReceiver(M.dtlsTransport,E),y=h.track,o.push([y,h]),n.addTrack(y),t.localStreams.length>0&&t.localStreams[0].getTracks().length>=s){var j=t.localStreams[0].getTracks()[s];p=new RTCRtpSender(j,M.dtlsTransport)}t.transceivers[s]={iceGatherer:M.iceGatherer,iceTransport:M.iceTransport,dtlsTransport:M.dtlsTransport,localCapabilities:g,remoteCapabilities:S,rtpSender:p,rtpReceiver:h,kind:E,mid:O,cname:x,sendEncodingParameters:v,recvEncodingParameters:m},t._transceive(t.transceivers[s],!1,"sendrecv"===R||"sendonly"===R)}}),this.remoteDescription={type:e.type,sdp:e.sdp},e.type){case"offer":this._updateSignalingState("have-remote-offer");break;case"answer":this._updateSignalingState("stable");break;default:throw new TypeError('unsupported type "'+e.type+'"')}return n.getTracks().length&&(t.remoteStreams.push(n),window.setTimeout(function(){var e=new Event("addstream");e.stream=n,t.dispatchEvent(e),null!==t.onaddstream&&window.setTimeout(function(){t.onaddstream(e)},0),o.forEach(function(r){var o=r[0],i=r[1],a=new Event("track");a.track=o,a.receiver=i,a.streams=[n],t.dispatchEvent(e),null!==t.ontrack&&window.setTimeout(function(){t.ontrack(a)},0)})},0)),arguments.length>1&&"function"==typeof arguments[1]&&window.setTimeout(arguments[1],0),Promise.resolve()},window.RTCPeerConnection.prototype.close=function(){this.transceivers.forEach(function(e){e.iceTransport&&e.iceTransport.stop(),e.dtlsTransport&&e.dtlsTransport.stop(),e.rtpSender&&e.rtpSender.stop(),e.rtpReceiver&&e.rtpReceiver.stop()}),this._updateSignalingState("closed")},window.RTCPeerConnection.prototype._updateSignalingState=function(e){this.signalingState=e;var t=new Event("signalingstatechange");this.dispatchEvent(t),null!==this.onsignalingstatechange&&this.onsignalingstatechange(t)},window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded=function(){var e=new Event("negotiationneeded");this.dispatchEvent(e),null!==this.onnegotiationneeded&&this.onnegotiationneeded(e)},window.RTCPeerConnection.prototype._updateConnectionState=function(){var e,t=this,n={"new":0,closed:0,connecting:0,checking:0,connected:0,completed:0,failed:0};if(this.transceivers.forEach(function(e){n[e.iceTransport.state]++,n[e.dtlsTransport.state]++}),n.connected+=n.completed,e="new",n.failed>0?e="failed":n.connecting>0||n.checking>0?e="connecting":n.disconnected>0?e="disconnected":n["new"]>0?e="new":(n.connected>0||n.completed>0)&&(e="connected"),e!==t.iceConnectionState){t.iceConnectionState=e;var r=new Event("iceconnectionstatechange");this.dispatchEvent(r),null!==this.oniceconnectionstatechange&&this.oniceconnectionstatechange(r)}},window.RTCPeerConnection.prototype.createOffer=function(){var e=this;if(this._pendingOffer)throw new Error("createOffer called while there is a pending offer.");var t;1===arguments.length&&"function"!=typeof arguments[0]?t=arguments[0]:3===arguments.length&&(t=arguments[2]);var n=[],o=0,i=0;if(this.localStreams.length&&(o=this.localStreams[0].getAudioTracks().length,i=this.localStreams[0].getVideoTracks().length),t){if(t.mandatory||t.optional)throw new TypeError("Legacy mandatory/optional constraints not supported.");void 0!==t.offerToReceiveAudio&&(o=t.offerToReceiveAudio),void 0!==t.offerToReceiveVideo&&(i=t.offerToReceiveVideo)}for(this.localStreams.length&&this.localStreams[0].getTracks().forEach(function(e){n.push({kind:e.kind,track:e,wantReceive:"audio"===e.kind?o>0:i>0}),"audio"===e.kind?o--:"video"===e.kind&&i--});o>0||i>0;)o>0&&(n.push({kind:"audio",wantReceive:!0}),o--),i>0&&(n.push({kind:"video",wantReceive:!0}),i--);var a=r.writeSessionBoilerplate(),c=[];n.forEach(function(t,n){var o,i,s=t.track,u=t.kind,d=r.generateIdentifier(),f=e._createIceAndDtlsTransports(d,n),l=RTCRtpSender.getCapabilities(u),p=[{ssrc:1001*(2*n+1)}];s&&(o=new RTCRtpSender(s,f.dtlsTransport)),t.wantReceive&&(i=new RTCRtpReceiver(f.dtlsTransport,u)),c[n]={iceGatherer:f.iceGatherer,iceTransport:f.iceTransport,dtlsTransport:f.dtlsTransport,localCapabilities:l,remoteCapabilities:null,rtpSender:o,rtpReceiver:i,kind:u,mid:d,sendEncodingParameters:p,recvEncodingParameters:null};var h=c[n];a+=r.writeMediaSection(h,h.localCapabilities,"offer",e.localStreams[0])}),this._pendingOffer=c;var s=new RTCSessionDescription({type:"offer",sdp:a});return arguments.length&&"function"==typeof arguments[0]&&window.setTimeout(arguments[0],0,s),Promise.resolve(s)},window.RTCPeerConnection.prototype.createAnswer=function(){var e=this,t=r.writeSessionBoilerplate();this.transceivers.forEach(function(n){var o=e._getCommonCapabilities(n.localCapabilities,n.remoteCapabilities);t+=r.writeMediaSection(n,o,"answer",e.localStreams[0])});var n=new RTCSessionDescription({type:"answer",sdp:t});return arguments.length&&"function"==typeof arguments[0]&&window.setTimeout(arguments[0],0,n),Promise.resolve(n)},window.RTCPeerConnection.prototype.addIceCandidate=function(e){if(null===e)this.transceivers.forEach(function(e){e.iceTransport.addIceCandidate({})});else{var t=e.sdpMLineIndex;if(e.sdpMid)for(var n=0;n<this.transceivers.length;n++)if(this.transceivers[n].mid===e.sdpMid){t=n;break}var o=this.transceivers[t];if(o){var i=Object.keys(e.candidate).length>0?r.parseCandidate(e.candidate):{};if("tcp"===i.protocol&&0===i.port)return;if("1"!==i.component)return;"endOfCandidates"===i.type&&(i={}),o.iceTransport.addRemoteCandidate(i);var a=r.splitSections(this.remoteDescription.sdp);a[t+1]+=(i.type?e.candidate.trim():"a=end-of-candidates")+"\r\n",this.remoteDescription.sdp=a.join("")}}return arguments.length>1&&"function"==typeof arguments[1]&&window.setTimeout(arguments[1],0),Promise.resolve()},window.RTCPeerConnection.prototype.getStats=function(){var e=[];this.transceivers.forEach(function(t){["rtpSender","rtpReceiver","iceGatherer","iceTransport","dtlsTransport"].forEach(function(n){t[n]&&e.push(t[n].getStats())})});var t=arguments.length>1&&"function"==typeof arguments[1]&&arguments[1];return new Promise(function(n){var r=new Map;Promise.all(e).then(function(e){e.forEach(function(e){Object.keys(e).forEach(function(t){r.set(t,e[t]),r[t]=e[t]})}),t&&window.setTimeout(t,0,r),n(r)})})}},attachMediaStream:function(e,t){o("DEPRECATED, attachMediaStream will soon be removed."),e.srcObject=t},reattachMediaStream:function(e,t){o("DEPRECATED, reattachMediaStream will soon be removed."),e.srcObject=t.srcObject}};e.e={shimPeerConnection:i.shimPeerConnection,shimGetUserMedia:n(154),attachMediaStream:i.attachMediaStream,reattachMediaStream:i.reattachMediaStream}},function(e,t,n){"use strict";e.e=function(){var e=function(e){return{name:{PermissionDeniedError:"NotAllowedError"}[e.name]||e.name,message:e.message,constraint:e.constraint,toString:function(){return this.name}}},t=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=function(n){return t(n)["catch"](function(t){return Promise.reject(e(t))})}}},function(e,t,n){"use strict";var r=n(0).log,o=n(0).browserDetails,i={shimOnTrack:function(){"object"!=typeof window||!window.RTCPeerConnection||"ontrack"in window.RTCPeerConnection.prototype||Object.defineProperty(window.RTCPeerConnection.prototype,"ontrack",{get:function(){return this._ontrack},set:function(e){this._ontrack&&(this.removeEventListener("track",this._ontrack),this.removeEventListener("addstream",this._ontrackpoly)),this.addEventListener("track",this._ontrack=e),this.addEventListener("addstream",this._ontrackpoly=function(e){e.stream.getTracks().forEach(function(t){var n=new Event("track");n.track=t,n.receiver={track:t},n.streams=[e.stream],this.dispatchEvent(n)}.bind(this))}.bind(this))}})},shimSourceObject:function(){"object"==typeof window&&(!window.HTMLMediaElement||"srcObject"in window.HTMLMediaElement.prototype||Object.defineProperty(window.HTMLMediaElement.prototype,"srcObject",{get:function(){return this.mozSrcObject},set:function(e){this.mozSrcObject=e}}))},shimPeerConnection:function(){if("object"==typeof window&&(window.RTCPeerConnection||window.mozRTCPeerConnection)){window.RTCPeerConnection||(window.RTCPeerConnection=function(e,t){if(o.version<38&&e&&e.iceServers){for(var n=[],r=0;r<e.iceServers.length;r++){var i=e.iceServers[r];if(i.hasOwnProperty("urls"))for(var a=0;a<i.urls.length;a++){var c={url:i.urls[a]};0===i.urls[a].indexOf("turn")&&(c.username=i.username,c.credential=i.credential),n.push(c)}else n.push(e.iceServers[r])}e.iceServers=n}return new mozRTCPeerConnection(e,t)},window.RTCPeerConnection.prototype=mozRTCPeerConnection.prototype,mozRTCPeerConnection.generateCertificate&&Object.defineProperty(window.RTCPeerConnection,"generateCertificate",{get:function(){return mozRTCPeerConnection.generateCertificate}}),window.RTCSessionDescription=mozRTCSessionDescription,window.RTCIceCandidate=mozRTCIceCandidate),["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach(function(e){var t=RTCPeerConnection.prototype[e];RTCPeerConnection.prototype[e]=function(){return arguments[0]=new("addIceCandidate"===e?RTCIceCandidate:RTCSessionDescription)(arguments[0]),t.apply(this,arguments)}});var e=RTCPeerConnection.prototype.addIceCandidate;RTCPeerConnection.prototype.addIceCandidate=function(){return null===arguments[0]?Promise.resolve():e.apply(this,arguments)};var t=function(e){var t=new Map;return Object.keys(e).forEach(function(n){t.set(n,e[n]),t[n]=e[n]}),t},n=RTCPeerConnection.prototype.getStats;RTCPeerConnection.prototype.getStats=function(e,r,o){return n.apply(this,[e||null]).then(function(e){return t(e)}).then(r,o)}}},shimGetUserMedia:function(){var e=function(e,t,n){var i=function(e){if("object"!=typeof e||e.require)return e;var t=[];return Object.keys(e).forEach(function(n){if("require"!==n&&"advanced"!==n&&"mediaSource"!==n){var r=e[n]="object"==typeof e[n]?e[n]:{ideal:e[n]};if(void 0===r.min&&void 0===r.max&&void 0===r.exact||t.push(n),void 0!==r.exact&&("number"==typeof r.exact?r.min=r.max=r.exact:e[n]=r.exact,delete r.exact),void 0!==r.ideal){e.advanced=e.advanced||[];var o={};"number"==typeof r.ideal?o[n]={min:r.ideal,max:r.ideal}:o[n]=r.ideal,e.advanced.push(o),delete r.ideal,Object.keys(r).length||delete e[n]}}}),t.length&&(e.require=t),e};return e=JSON.parse(JSON.stringify(e)),o.version<38&&(r("spec: "+JSON.stringify(e)),e.audio&&(e.audio=i(e.audio)),e.video&&(e.video=i(e.video)),r("ff37: "+JSON.stringify(e))),navigator.mozGetUserMedia(e,t,n)};navigator.getUserMedia=e;var t=function(e){return new Promise(function(t,n){navigator.getUserMedia(e,t,n)})};if(navigator.mediaDevices||(navigator.mediaDevices={getUserMedia:t,addEventListener:function(){},removeEventListener:function(){}}),navigator.mediaDevices.enumerateDevices=navigator.mediaDevices.enumerateDevices||function(){return new Promise(function(e){
	var t=[{kind:"audioinput",deviceId:"default",label:"",groupId:""},{kind:"videoinput",deviceId:"default",label:"",groupId:""}];e(t)})},o.version<41){var n=navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);navigator.mediaDevices.enumerateDevices=function(){return n().then(void 0,function(e){if("NotFoundError"===e.name)return[];throw e})}}},attachMediaStream:function(e,t){r("DEPRECATED, attachMediaStream will soon be removed."),e.srcObject=t},reattachMediaStream:function(e,t){r("DEPRECATED, reattachMediaStream will soon be removed."),e.srcObject=t.srcObject}};e.e={shimOnTrack:i.shimOnTrack,shimSourceObject:i.shimSourceObject,shimPeerConnection:i.shimPeerConnection,shimGetUserMedia:n(156),attachMediaStream:i.attachMediaStream,reattachMediaStream:i.reattachMediaStream}},function(e,t,n){"use strict";var r=n(0).log,o=n(0).browserDetails;e.e=function(){var e=function(e){return{name:{SecurityError:"NotAllowedError",PermissionDeniedError:"NotAllowedError"}[e.name]||e.name,message:{"The operation is insecure.":"The request is not allowed by the user agent or the platform in the current context."}[e.message]||e.message,constraint:e.constraint,toString:function(){return this.name+(this.message&&": ")+this.message}}},t=function(t,n,i){var a=function(e){if("object"!=typeof e||e.require)return e;var t=[];return Object.keys(e).forEach(function(n){if("require"!==n&&"advanced"!==n&&"mediaSource"!==n){var r=e[n]="object"==typeof e[n]?e[n]:{ideal:e[n]};if(void 0===r.min&&void 0===r.max&&void 0===r.exact||t.push(n),void 0!==r.exact&&("number"==typeof r.exact?r.min=r.max=r.exact:e[n]=r.exact,delete r.exact),void 0!==r.ideal){e.advanced=e.advanced||[];var o={};"number"==typeof r.ideal?o[n]={min:r.ideal,max:r.ideal}:o[n]=r.ideal,e.advanced.push(o),delete r.ideal,Object.keys(r).length||delete e[n]}}}),t.length&&(e.require=t),e};return t=JSON.parse(JSON.stringify(t)),o.version<38&&(r("spec: "+JSON.stringify(t)),t.audio&&(t.audio=a(t.audio)),t.video&&(t.video=a(t.video)),r("ff37: "+JSON.stringify(t))),navigator.mozGetUserMedia(t,n,function(t){i(e(t))})};navigator.getUserMedia=t;var n=function(e){return new Promise(function(t,n){navigator.getUserMedia(e,t,n)})};if(navigator.mediaDevices||(navigator.mediaDevices={getUserMedia:n,addEventListener:function(){},removeEventListener:function(){}}),navigator.mediaDevices.enumerateDevices=navigator.mediaDevices.enumerateDevices||function(){return new Promise(function(e){var t=[{kind:"audioinput",deviceId:"default",label:"",groupId:""},{kind:"videoinput",deviceId:"default",label:"",groupId:""}];e(t)})},o.version<41){var i=navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);navigator.mediaDevices.enumerateDevices=function(){return i().then(void 0,function(e){if("NotFoundError"===e.name)return[];throw e})}}if(o.version<49){var a=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=function(t){return a(t)["catch"](function(t){return Promise.reject(e(t))})}}}},function(e,t,n){"use strict";var r={shimGetUserMedia:function(){navigator.getUserMedia=navigator.webkitGetUserMedia}};e.e={shimGetUserMedia:r.shimGetUserMedia}},function(e,t,n){e.e=n(49)}])});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Root reference for iframes.
	 */

	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  console.warn("Using browser-only version of superagent in non-browser environment");
	  root = this;
	}

	var Emitter = __webpack_require__(3);
	var requestBase = __webpack_require__(4);
	var isObject = __webpack_require__(5);

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Expose `request`.
	 */

	var request = module.exports = __webpack_require__(6).bind(null, Request);

	/**
	 * Determine XHR.
	 */

	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  throw Error("Browser-only verison of superagent could not find XHR");
	};

	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */

	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */

	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    if (null != obj[key]) {
	      pushEncodedKeyValuePair(pairs, key, obj[key]);
	    }
	  }
	  return pairs.join('&');
	}

	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */

	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (Array.isArray(val)) {
	    return val.forEach(function(v) {
	      pushEncodedKeyValuePair(pairs, key, v);
	    });
	  } else if (isObject(val)) {
	    for(var subkey in val) {
	      pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
	    }
	    return;
	  }
	  pairs.push(encodeURIComponent(key)
	    + '=' + encodeURIComponent(val));
	}

	/**
	 * Expose serialization method.
	 */

	 request.serializeObject = serialize;

	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */

	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var pair;
	  var pos;

	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    pos = pair.indexOf('=');
	    if (pos == -1) {
	      obj[decodeURIComponent(pair)] = '';
	    } else {
	      obj[decodeURIComponent(pair.slice(0, pos))] =
	        decodeURIComponent(pair.slice(pos + 1));
	    }
	  }

	  return obj;
	}

	/**
	 * Expose parser.
	 */

	request.parseString = parseString;

	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */

	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};

	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */

	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };

	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */

	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};

	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;

	  lines.pop(); // trailing CRLF

	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }

	  return fields;
	}

	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */

	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	function type(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function params(str){
	  return str.split(/ *; */).reduce(function(obj, str){
	    var parts = str.split(/ *= */),
	        key = parts.shift(),
	        val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */

	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this._setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this._setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this._parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};

	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */

	Response.prototype._setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);

	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};

	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */

	Response.prototype._parseBody = function(str){
	  var parse = request.parse[this.type];
	  if (!parse && isJSON(this.type)) {
	    parse = request.parse['application/json'];
	  }
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};

	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */

	Response.prototype._setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }

	  var type = status / 100 | 0;

	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;

	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;

	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};

	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */

	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;

	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;

	  return err;
	};

	/**
	 * Expose `Response`.
	 */

	request.Response = Response;

	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */

	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;

	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
	      // issue #876: return the http status code if the response parsing fails
	      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
	      return self.callback(err);
	    }

	    self.emit('response', res);

	    var new_err;
	    try {
	      if (res.status < 200 || res.status >= 300) {
	        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	        new_err.original = err;
	        new_err.response = res;
	        new_err.status = res.status;
	      }
	    } catch(e) {
	      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
	    }

	    // #1000 don't catch errors from the callback to avoid double calling it
	    if (new_err) {
	      self.callback(new_err, res);
	    } else {
	      self.callback(null, res);
	    }
	  });
	}

	/**
	 * Mixin `Emitter` and `requestBase`.
	 */

	Emitter(Request.prototype);
	for (var key in requestBase) {
	  Request.prototype[key] = requestBase[key];
	}

	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};

	/**
	 * Set responseType to `val`. Presently valid responseTypes are 'blob' and
	 * 'arraybuffer'.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};

	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};

	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass, options){
	  if (!options) {
	    options = {
	      type: 'basic'
	    }
	  }

	  switch (options.type) {
	    case 'basic':
	      var str = btoa(user + ':' + pass);
	      this.set('Authorization', 'Basic ' + str);
	    break;

	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	  }
	  return this;
	};

	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/

	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};

	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, filename){
	  this._getFormData().append(field, file, filename || file.name);
	  return this;
	};

	Request.prototype._getFormData = function(){
	  if (!this._formData) {
	    this._formData = new root.FormData();
	  }
	  return this._formData;
	};

	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */

	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};

	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */

	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;

	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;

	  this.callback(err);
	};

	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */

	Request.prototype._timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};

	/**
	 * Compose querystring to append to req.url
	 *
	 * @api private
	 */

	Request.prototype._appendQueryString = function(){
	  var query = this._query.join('&');
	  if (query) {
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }
	};

	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var timeout = this._timeout;
	  var data = this._formData || this._data;

	  // store callback
	  this._callback = fn || noop;

	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;

	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }

	    if (0 == status) {
	      if (self.timedout) return self._timeoutError();
	      if (self._aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };

	  // progress
	  var handleProgress = function(e){
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = 'download';
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    xhr.onprogress = handleProgress;
	  }
	  try {
	    if (xhr.upload && this.hasListeners('progress')) {
	      xhr.upload.onprogress = handleProgress;
	    }
	  } catch(e) {
	    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	    // Reported here:
	    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	  }

	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }

	  // querystring
	  this._appendQueryString();

	  // initiate request
	  if (this.username && this.password) {
	    xhr.open(this.method, this.url, true, this.username, this.password);
	  } else {
	    xhr.open(this.method, this.url, true);
	  }

	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;

	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
	    if (serialize) data = serialize(data);
	  }

	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }

	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }

	  // send stuff
	  this.emit('request', this);

	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};


	/**
	 * Expose `Request`.
	 */

	request.Request = Request;

	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * OPTIONS query to `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.options = function(url, data, fn){
	  var req = request('OPTIONS', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	function del(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};

	request['del'] = del;
	request['delete'] = del;

	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */

	if (true) {
	  module.exports = Emitter;
	}

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(5);

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.clearTimeout = function _clearTimeout(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};

	/**
	 * Override default response body parser
	 *
	 * This function will be called to convert incoming data into request.body
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Override default request body serializer
	 *
	 * This function will be called to convert data set via .send or .attach into payload to send
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.serialize = function serialize(fn){
	  this._serializer = fn;
	  return this;
	};

	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.timeout = function timeout(ms){
	  this._timeout = ms;
	  return this;
	};

	/**
	 * Promise support
	 *
	 * @param {Function} resolve
	 * @param {Function} reject
	 * @return {Request}
	 */

	exports.then = function then(resolve, reject) {
	  if (!this._fullfilledPromise) {
	    var self = this;
	    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
	      self.end(function(err, res){
	        if (err) innerReject(err); else innerResolve(res);
	      });
	    });
	  }
	  return this._fullfilledPromise.then(resolve, reject);
	}

	/**
	 * Allow for extension
	 */

	exports.use = function use(fn) {
	  fn(this);
	  return this;
	}


	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	exports.get = function(field){
	  return this._header[field.toLowerCase()];
	};

	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */

	exports.getHeader = exports.get;

	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};

	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	exports.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	exports.field = function(name, val) {
	  this._getFormData().append(name, val);
	  return this;
	};

	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	exports.abort = function(){
	  if (this._aborted) {
	    return this;
	  }
	  this._aborted = true;
	  this.xhr && this.xhr.abort(); // browser
	  this.req && this.req.abort(); // node
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};

	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */

	exports.withCredentials = function(){
	  // This is browser-only functionality. Node side is no-op.
	  this._withCredentials = true;
	  return this;
	};

	/**
	 * Set the max redirects to `n`. Does noting in browser XHR implementation.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.redirects = function(n){
	  this._maxRedirects = n;
	  return this;
	};

	/**
	 * Convert to a plain javascript object (not JSON string) of scalar properties.
	 * Note as this method is designed to return a useful non-this value,
	 * it cannot be chained.
	 *
	 * @return {Object} describing method, url, and data of this request
	 * @api public
	 */

	exports.toJSON = function(){
	  return {
	    method: this.method,
	    url: this.url,
	    data: this._data,
	    headers: this._header
	  };
	};

	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	exports._isHost = function _isHost(obj) {
	  var str = {}.toString.call(obj);

	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}

	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	 *      request.post('/user')
	 *        .send('name=tobi')
	 *        .send('species=ferret')
	 *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.send = function(data){
	  var obj = isObject(data);
	  var type = this._header['content-type'];

	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    // default to x-www-form-urlencoded
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }

	  if (!obj || this._isHost(data)) return this;

	  // default to json
	  if (!type) this.type('json');
	  return this;
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return null !== obj && 'object' === typeof obj;
	}

	module.exports = isObject;


/***/ },
/* 6 */
/***/ function(module, exports) {

	// The node and browser modules expose versions of this with the
	// appropriate constructor function bound as first argument
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */

	function request(RequestConstructor, method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new RequestConstructor('GET', method).end(url);
	  }

	  // url first
	  if (2 == arguments.length) {
	    return new RequestConstructor('GET', method);
	  }

	  return new RequestConstructor(method, url);
	}

	module.exports = request;


/***/ }
/******/ ]);