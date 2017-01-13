var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Promise = require('bluebird');
var http = require('http');
var request = require('request');
/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

var readFileAsync = Promise.promisify(fs.readFile);
var writefileAsync = Promise.promisify(fs.writeFile);
var appendFileAsync = Promise.promisify(fs.appendFile);
var readdirAsync = Promise.promisify(fs.readdir);
exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  readFileAsync(exports.paths.list)
  .then(function(file) {
    var array = file.toString().split('\n');
    callback(array);

  })
  .catch(function (error) {
    callback(error);
  });
};

exports.isUrlInList = function(url, callback) {
  var file = exports.readListOfUrls(function(data) {
    console.log(data);
    for (var i = 0; i < data.length; i++ ) {
      if (url === data[i]) {
        console.log(data[i]);
        callback(true);
        return;
      }
    }
    callback(false);
  });


};
var isUrlInListAsync = Promise.promisify(exports.isUrlInList);
exports.addUrlToList = function(url, callback) {
  //start by calling writefileasync(exports.path.list, callback) function
  isUrlInListAsync(url).then(
    function(isInList) {
      if (!isInList) {
        appendFileAsync(exports.paths.list, url).then(callback())
        .catch(function(error) {
          throw error;
        });
      }
    }
  ).catch(function(error) {
    throw error;
  });

};

exports.isUrlArchived = function(url, callback) {
  readdirAsync(exports.paths.archivedSites).then(function(files) {
    console.log('files',files);
    for (var i = 0; i < files.length; i++) {
      console.log('url',url);
      console.log('files[i]',files[i]);
      if (url === files[i]) {
        callback(true);
        return true;
      }
    }
    callback(false);

  }).catch(function(error) {

    console.log(error);
    throw error;
  });

  //callback(false);
};

exports.downloadUrls = function(urls) {
  var file;
  for (url of urls) {
    if (!url) { return; }
    console.log("url", url);
    console.log('urls', urls);
    file = fs.createWriteStream(exports.paths.archivedSites + '/' + url);
    request('http://' + url).pipe(file);
  }
};

/*
var request = require('request');

exports.downloadUrls = function(urls) {
  // Iterate over urls and pipe to new files
  _.each(urls, function (url) {
    if (!url) { return; }
    request('http://' + url).pipe(fs.createWriteStream(exports.paths.archivedSites + '/' + url));
  });
};
*/
