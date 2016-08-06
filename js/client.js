var Quagga = require('quagga');
var request = require('superagent');
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
