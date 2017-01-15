var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var Promise = require('bluebird');
var urlUtil = require('url');
var helper = require('./http-helpers');

// var indexFile = require('./public/index.html');
// require more modules/folders here!

var readFileAsync = Promise.promisify(fs.readFile);

var writeFileAsync = Promise.promisify(fs.writeFile);

// var router = {
//   '/':
// }
//path: ./web/public/index.html
var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
};



var serveAssets1 = function(req, callback) {
  var filePath1 = urlUtil.parse(req.url).pathname;
  (filePath1 === '/') && (filePath1 = '/index.html');
  filePath1 = archive.paths.siteAssets + filePath1;
  console.log('sendResponse filePath1 ', filePath1);
  fs.readFile(filePath1, function(err, content) {
    callback (content);
  });
};

// var sendResponse = function(res, content, statusCode = 200) {
//   res.writeHead(statusCode, helper.headers);
//   res.end(content);
// };

// var send404Response = function(res) {
//   res.writeHead(404);
//   res.end();
// };

// var serveAssets = function(asset, res, callback) {
//   (asset === '/') && (asset = '/index.html');
//   filePath1 = archive.paths.siteAssets + asset;
//   readFileAsync(filePath1)
//   .then(function(content) {
//     content && sendResponse(res, content);
//   })
//   .catch(function(err) {
//     //request file is not in public folder, user wants archived file
//     return readFileAsync(archive.paths.archivedSites + asset);
//   })
//   .then(function(content) {
//     content && sendResponse(res, content);
//   })
//   .catch(function(err) {
//     //file doesnt exist in archive!
//     throw error;
//   });
// };


exports.handleRequest = function (req, res) {
  var asset = urlUtil.parse(req.url).pathname;

  if (asset === '/' && req.method === 'GET') {
    console.log('path / GET');
    helper.serveAssets(asset, res);

  } else if (req.url === '/www.google.com') {
    helper.serveAssets(asset, res);

  } else if (req.method === 'POST') {
    var path = urlUtil.parse(req.url).pathname;

    var filePath = archive.paths.archivedSites + req.url;

    //get url
    // is in site.txt?
    //if yes,
      //is it archived?
        //display page (Redirect!)
      // if no
        // display loading (Redirect!)
    // if no
      //append sites.txt
      //redirect loading. If send html content back on POST, annoying popup - confirm submission. Therefore, redirect to loading page, and get browser to send another GET sometime later


    helper.collectDataAsync(req)
    .then(function(data) {
      data = data.split('=')[1]; //remove the 'url='
      return writeFileAsync(archive.paths.list, data + '\n');
    })
    .then( function () {
      helper.sendResponse(res, '', 302);
    })
    .catch(function(err) {
      console.log('404?');
      helper.send404Response(res);
      throw err;
    });

    // helper.collectData(req, function(data) {
    //   data = data.slice(4);
    //   console.log('data to be appended ',data);
    //   res.writeHead(302, helper.headers);
    //   writeFileAsync(archive.paths.list, data+'\n')
    //   .then(function() {
    //     res.end();
    //   }).catch(function(error) {
    //     send404Response(res);
    //     throw error;
    //   });
    // });

  } else {
    res.writeHead(404);
    res.end();
  }

  // res.end('./public/index.html');
};


