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
  console.log('asset:', asset);
  console.log('req.url: ',req.url);
  console.log('req method:', req.method);

  if (req.method === 'GET') {
    console.log('path / GET');
    helper.serveAssets(asset, res, function() {
      //if the path cannot be found in public folder or archive
      //check if it is on list, site.txt, if yes, return loading, else error
      (asset[0] === '/') && (asset = asset.slice(1));
      console.log('asset trim:', asset);
      archive.isUrlInListAsync(asset)
      .then((found)=>{
        console.log('found: ',found);
        if (found) {
          console.log('not in ');
          helper.redirectResponse(res, '/loading.html');
        } else {
          helper.send404Response(res);
        }
      })
      .catch(()=>{
        helper.send404Response(res);
      });

    });

  } else if (req.method === 'POST') {
    //url is in asset

    var filePath = archive.paths.archivedSites + '/' + asset;


    //.catch((err)=>{ throw err; });

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
    .then(function(url) {
      url = url.split('=')[1]; //remove the 'url='
      //return writeFileAsync(archive.paths.list, url + '\n');
      archive.isUrlInListAsync(url)
      .then((isInList)=>{
        if (isInList) {
          return archive.isUrlArchivedAsync(url)
          .then((isArchived)=>{
            if (isArchived) {
              console.log('before res');
              helper.redirectResponse(res, '/'+ url);
              console.log('after res');
            } else {
              console.log('before res not found');
              helper.redirectResponse(res, '/loading.html');
            }
          });
          //.catch((error)=>{ helper.redirectResponse(res, '/loading.html'); });
        } else {
          //if url is not in list, append to sites.txt
          return archive.addUrlToListAsync(url)
          .then(()=>{
            console.log('go into redirect response~');
            //***Q why my redirection to loading page is not working?
            helper.redirectResponse(res, '/loading.html');
          });
        }
      });
    })
    .then( function () {
      console.log('I got to this line');
      //helper.sendResponse(res, '', 302);
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


