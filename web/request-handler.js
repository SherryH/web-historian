var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var Promise = require('bluebird');

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

var collectData = function(request, callback) {
  var data = '';
  console.log('before data', data);
  console.log('request is passed in?', request.input);
  request.on('data', function(chunk) {
    data += chunk;
    console.log('data inside', data);
  });
  request.on('end', function() {
    console.log('data collected', data);
    callback(data);
  });
};

exports.handleRequest = function (req, res) {
  res.writeHead(200, headers);

  var filePath;
  console.log(req.url);
  if (req.url === '/' && req.method === 'GET') {
    filePath = archive.paths.siteAssets + '/index.html';
    readFileAsync(filePath).then(function(contents) {
      return res.end(contents);
    })
    .catch(function(err) {
      throw err;
    });

  } else if (req.url === '/www.google.com') {
    filePath = archive.paths.archivedSites + req.url;
    readFileAsync(filePath).then(function(contents) {
      return res.end(contents);
    })
    .catch(function(err) {
      throw err;
    });
  } else if (req.method === 'POST') {
    console.log('in post');
    console.log('req.url', req.url);
    filePath = archive.paths.archivedSites + req.url;
    console.log('filePath', filePath);
    collectData(req, function(data) {
      console.log('collectData');
      //console.log(data.toString().splice(4));
      //console.log(data.url);
      // console.log(typeof data);
      // data = JSON.stringify(data);
      // console.log(JSON.parse(data));
      // console.log(JSON.parse(data).toString().splice(4));
      data = data.slice(4);
      res.writeHead(302, headers);
      writeFileAsync(archive.paths.list, data+'\n').then(res.end()).catch(function(error) {
        throw error;
      });


    });

  } else {
    res.writeHead(404);
    res.end();
  }

  // res.end('./public/index.html');
};


