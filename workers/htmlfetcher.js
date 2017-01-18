// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
//read the url from site.txt
// if url is not archived
//download the page
var archive = require('../helpers/archive-helpers');

archive.readListOfUrlsAsync()
.then((urlListArray)=>{
  archive.downloadUrlsAsync(urlListArray);

})
.catch((err)=>{ console.log(err); });