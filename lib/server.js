(function() {
  'use strict';

  var util = require('util');
  var path = require('path');
  var NB = require('nodebrainz');
  var express = require('express');
  var app = express();
  var haml = require('hamljs');
  var phantom = require('phantom');
  var debounce = require('lodash.debounce');
  var nb;

  var requestQueue = [];
  setInterval(serviceQueue, 1200);

  module.exports = Server;

  function Server() {}

  var $class = Server.prototype;

  $class.start = function() {
    app.engine('.haml', renderHaml);
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'hamljs');
    app.get('/', index);
    app.use('/js', express.static('js'));
    app.use('/css', express.static('css'));
    app.get('/barcode/:barcode', barcodeSearch);
    app.get('/searchNew.png', renderNewSearch);
    app.get('/searchOld.png', renderOldSearch);

    app.listen(3000);

    nb = new NB({userAgent:'chive-wrfl/1.0.0 ( https://github.com/mildmojo/chive-wrfl )'});
  };

  function index(req, res, next) {
    res.render('index.haml');
  }

  function barcodeSearch(req, res, next) {
    requestQueue.push(function() {
      console.log((new Date().toString()) + ' Searching Musicbrainz...');
      nb.search('release', {barcode: req.params.barcode}, function(err, response) {
  console.dir(err);
        if (err) return res.status(500).send('Oops, ' + err.error + ' (' + err.statusCode + ')');

        var body = '';
        if (response.releases.length === 0) {
          body = 'No results';
        } else {
          var release = response.releases[0];
          body = {
            artist: release['artist-credit'][0].artist.name,
            title: release.title,
            date: release.date
          };
        }
        res.status(200).send(body);
      });
    });
  }

  function serviceQueue() {
    if (!requestQueue.length) return;
    requestQueue[0].call();
    requestQueue.shift();
  }

  function renderNewSearch(req, res, next) {
    var artist = req.query.artist;
    var title = req.query.title;
    var url = 'http://wrfl.fm/search/plays';
    var formInfo = {
      '#play_artist': artist,
      '#play_album': title,
      form: '#new_play'
    };

    console.log('artist + title: ', artist, title);

    searchToImage(url, formInfo, removeCruft, function(err, imageData) {
      if (err) {
        res.status(500).send('Error fetching search page: ' + err);
      } else {
        res.set('Content-Type', 'image/png');
        res.status(200).send(imageData);
      }
    });

    function removeCruft() {
      var badElements = [
        '#header-bar',
        '.menu',
        '.social-links',
        'br',
        'h1.page-title',
        '#reg-form > p',
        'center'
      ];
      badElements.forEach(function(elem) {
        var elems = document.querySelectorAll(elem);
        for (var i = elems.length; i--;) {
          elems[i].remove();
        }
      });
    }
  }

  function renderOldSearch(req, res, next) {
    var artist = req.query.artist;
    var title = req.query.title;
    var url = 'http://wrfl-server.ad.uky.edu/en/search/';
    var formInfo = {
      '#id_artist': artist,
      '#id_album': title,
      form: 'form[action="."]'
    };

    console.log('artist + title: ', artist, title);

    searchToImage(url, formInfo, removeCruft, function(err, imageData) {
      if (err) {
        res.status(500).send('Error fetching search page: ' + err);
      } else {
        res.set('Content-Type', 'image/png');
        res.status(200).send(imageData);
      }
    });

    function removeCruft() {
      var badElements = [
        '#nowTopBox',
        '#container',
        '#menu',
        '#whosplaying',
        'center'
      ];
      badElements.forEach(function(elem) {
        var elems = document.querySelectorAll(elem);
        for (var i = elems.length; i--;) {
          elems[i].remove();
        }
      });
      var mainContent = document.querySelector('#mainContent');
      mainContent.setAttribute('style', 'min-height: 0; width: auto');
    }
  }

  function searchToImage(url, formInfo, preprocessor, done) {
    preprocessor = preprocessor || function() {};
    var sitepage = null;
    var phInstance = null;
    var isDoneLoading = false;

    var allDone = debounce(function() {
      isDoneLoading = true;
    }, 5000);

    console.log('creating phantom object');
    phantom.create()
      .then(instance => {
          console.log('got instance');
          phInstance = instance;
          return instance.createPage();
      })
      .then(page => {
        console.log('got page');
        sitepage = page;
        page.on('onResourceRequested', () => {
          allDone();
        });
        page.on('onResourceReceived', () => {
          allDone();
        });
        page.on('onConsoleMessage', console.log);
        return page.open(url);
      })
      .then(status => {
          console.log('fetched page ' + url);
          console.log(status);
          sitepage.evaluate(submitForm, formInfo);
          return new Promise((resolve, reject) => {
            var startedAt = Date.now();
            check();
            function check() {
              if (isDoneLoading) { console.log('done'); return resolve(); }
              if (Date.now() - startedAt > 10000) return reject('Timed out waiting for load to finish');
              setTimeout(check, 250);
            }
          });
      })
      .then(() => {
        console.log('submitted form, got results');
        return sitepage.evaluate(preprocessor);
      })
      .then(() => {
          console.log('ran preprocessor');
          return sitepage.renderBase64();
      })
      .then(imageBase64 => {
          console.log('rendered!');
          sitepage.close();
          phInstance.exit();
          var buf = Buffer.from(imageBase64, 'base64');
          done(null, buf);
      })
      .catch(error => {
          console.log(error);
          phInstance.exit();
          done(error);
      });

    function submitForm(formInfo) {
      var form = document.querySelector(formInfo.form);
      delete formInfo.form;

      Object.keys(formInfo).forEach(function(selector) {
        var input = document.querySelector(selector);
        input.value = formInfo[selector];
      });

      form.submit();
    }
  }

  function renderHaml(templatePath, options, callback) {
    return haml.renderFile(templatePath, 'utf8', options, callback);
  }
})();
