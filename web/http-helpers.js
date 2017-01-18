var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var urlUtil = require('url');
var archive = require('../helpers/archive-helpers');

var readFileAsync = Promise.promisify(fs.readFile);

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};

exports.serveAssets = function(asset, res, callback) {
  (asset === '/') && (asset = '/index.html');
  filePath1 = archive.paths.siteAssets + asset;
  console.log(filePath1);
  readFileAsync(filePath1)
  .then(function(content) {
    // console.log('content:',content);
    content && exports.sendResponse(res, content);
  })
  .catch(function(err) {
    //request file is not in public folder, user wants archived file
    console.log('error: ',err);
    console.log('redirect asset: ', asset);
    return readFileAsync(archive.paths.archivedSites + asset);
  })
  .then(function(content) {
    content && exports.sendResponse(res, content);
  })
  .catch(function(err) {
    //file doesnt exist in archive!
    callback ? callback() : exports.send404Response(res);
    //console.log(err);
    //throw err;
  });
};

exports.collectData = function(request, callback) {
  var data = '';
  // console.log('before data', data);
  // console.log('request is passed in?', request.input);
  request.on('data', function(chunk) {
    data += chunk;
    // console.log('data inside', data);
  });
  request.on('end', function() {
    // console.log('data collected', data);
    callback(data);
  });
};

// var collectDataAsync = Promise.promisify(helper.collectData);
// Need to create own promise as the promisify function expects func(err, data)
exports.collectDataAsync = function(req) {
  return new Promise(function(resolve, reject) {
    exports.collectData(req, function (data) {
      resolve(data);
    });
  });
};

exports.sendResponse = function(res, content, statusCode = 200) {
  res.writeHead(statusCode, exports.headers);
  res.end(content);
};

exports.send404Response = function(res) {
  res.writeHead(404);
  res.end('404: Page not found');
};

exports.redirectResponse = function(res, redirectUrl) {
  console.log('loadingpage: ', redirectUrl);
  res.writeHead(302, {Location: redirectUrl});
  // console.log(res);
  res.end();
};

// As you progress, keep thinking about what helper functions you can put here!
