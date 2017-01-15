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
var appendFileAsync = Promise.promisify(fs.appendFile);
var accessAsync = Promise.promisify(fs.access);

var writefileAsync = Promise.promisify(fs.writeFile);
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

exports.readListOfUrlsAsync = function() {
  return new Promise (function(resolve, reject) {
    readFileAsync(exports.paths.list)
    .then(function(urlLists) {
      //console.log('urlLists looks like file stream straight out of file ', urlLists);
      var urlListsArray = urlLists.toString().split('\n');
      resolve(urlListsArray);
    })
    .catch((error)=>{ reject(error); });
  });
};


exports.isUrlInList = function(url, callback) {
  var file = exports.readListOfUrls(function(data) {
    console.log(data);
    for (var i = 0; i < data.length; i++ ) {
      if (url === data[i]) {
        // console.log(data[i]);
        callback(true);
        return;
      }
    }
    callback(false);
  });
};


exports.isUrlInListAsync = function (url) {
  return  new Promise(function(resolve, reject) {
    exports.readListOfUrlsAsync()
    .then((urlListsArray)=>{
      var isUrlInList = (urlListsArray.indexOf(url) !== -1);
      resolve(isUrlInList);
    })
    .catch((error)=>{ throw error; });
  });
};



//var isUrlInListAsync = Promise.promisify(exports.isUrlInList);
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

exports.addUrlToListAsync = function(url) {
  return new Promise((resolve, reject) =>{
    appendFileAsync(exports.paths.list, url+'\n')
    .then(resolve)
    .catch((err)=>{ throw err; });
  });
};


exports.isUrlArchived = function(url, callback) {
  readdirAsync(exports.paths.archivedSites).then(function(files) {
    console.log('files',files);
    for (var i = 0; i < files.length; i++) {
      // console.log('url',url);
      // console.log('files[i]',files[i]);
      if (url === files[i]) {
        callback(true);
        return true;
      }
    }
    callback(false);

  }).catch(function(error) {

    // console.log(error);
    throw error;
  });

  //callback(false);
};

exports.isUrlArchivedAsync = function(url) {
//return boolean
  return new Promise((resolve, reject)=>{
    //check the files in folder> all filename
    accessAsync(exports.paths.archivedSites + '/'+ url)
    .then(resolve)
    .catch(reject);
  });
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

exports.downloadUrlsAsync = function(urls) {
  //** Q: hmm there is no way to call a callback to take action after writestream pipe finishes?
  return new Promise((resolve, reject)=>{
    var file;
    urls.forEach((url)=>{
      //download each url to archivedSites
      file = fs.createWriteStream(exports.paths.archivedSites + '/' + url);
      request('http://' + url).pipe(file);
    });
  });
};

//--- Testing Helpers -------------
exports.isUrlArchivedAsync('www.github.com')
.then(()=>{
  console.log('loaded');
})
.catch((err)=>{ console.log('this file not archived?', err); });
//--------------------------------------
