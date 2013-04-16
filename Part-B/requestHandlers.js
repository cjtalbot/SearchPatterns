/**
 * @fileoverview This file handles the requests from the browser.
 * @author Christine Talbot
 */
var querystring = require('querystring');// for form parsing posted data
var readFiles = require('./readFiles');// for doing the calculations and reading
var fs = require('fs');
var utilities = require('./utilities');
var createPages = require('./createPages');

var BONE_COUNT = 31;

/**
 * This provides the first page for the application to confirm the list of
 *   files that should be processed.
 * @param {string} response What to return to the browser (usually an html page)
 * @param {string} postData Data that was sent/posted to the page
 * @return {string} Response data/page in the response parameter
 */
function start(response, postData) {
	// delete prior files to start clean
	try {
		fs.unlinkSync('patternFinder.html');
	} catch(e) {
		// do nothing - file doesn't exist
	}
	try {
		fs.unlinkSync('results.html');
	} catch(e) {
		// do nothing - file doesn't exist
	}
	try {
		fs.unlinkSync('hiddenform.html');
	} catch(e) {
		// do nothing - file doesn't exist
	}
	try {
		fs.unlinkSync('file1chart.js');
	} catch(e) {
		// do nothing - file doesn't exist
	}
	try {
		fs.unlinkSync('matchresults.html');
	} catch(e) {
		// do nothing - file doesn't exist
	}

	// read the list of files to be used
	var fileList = [];
	fileList = fs.readdirSync('inputfiles');
	var numFiles = 0;
	var fileListHTML = '';
	fileList.sort(); // sort the filelist alphabetically to preserve ordering

	// for each file, add it to the list to display on the html page
	for(var i = 0; i < fileList.length; i++) {
		if(fileList[i].indexOf('.txt') > -1) {
			fileListHTML = fileListHTML + 
						   '<br>File Number ' + 
						   (numFiles + 1) + 
						   ':  <input name="file' + 
						   numFiles + 
						   '" READONLY VALUE=' + 
						   fileList[i] + 
						   '></input>';
			numFiles = numFiles + 1;
		}
	}
	// Add a summary of how many files we read that have .txt in the name
	fileListHTML = fileListHTML + 
				   '<br><br>Total Number of Files: ' + 
				   numFiles + 
				   '<input name="numFiles" TYPE=HIDDEN VALUE=' + 
				   numFiles + 
				   '></input>';

	// create the page using the file list
	var body = createPages.createStartPage(fileListHTML);

	// respond or show the page generated
	response.writeHead(200, {'Content-Type' : 'text/html'});
	response.write(body);
	response.end();
}

/**
 * This provides the summary page of the files that were read in, including a
 *   couple of tables and a chart of the distances.
 * @param {string} response What to return to the browser (usually an html page)
 * @param {string} postData Data that was sent/posted to the page
 * @return {string} Response data/page in the response parameter
 */
function result(response, postData) {

	// retrieve data from the posted form on the prior page
	var numFiles = parseInt(querystring.parse(postData).numFiles);
	var fileList = new Array(numFiles);
	// for each file listed on start page, put into array
	var fName;
	for( i = 0; i < numFiles; i++) {
		fName = querystring.parse(postData)['file' + i];
		fileList[i] = 'inputfiles/' + fName;
	}
	
	// use the list of files provided to read all the data and create our
	// summary page
	readFiles.readFiles(fileList);

	// read the page created by the readFiles function and respond/show it
	fs.readFile('results.html', 
				'binary', 
				function(err, file) {
					if(err) {
						response.writeHead(500, 
										   {'Content-Type' : 'text/plain'});
						response.write(err + '\n');
						response.end();
						return;
					}

					response.writeHead(200);
					response.write(file, 'binary');
					response.end();
				});
}

/**
 * This provides the search form and the results of a search in a framed page.
 * @param {string} response What to return to the browser (usually an html page)
 * @param {string} postData Data that was sent/posted to the page
 * @return {string} Response data/page in the response parameter
 */
function patternFinder(response, postData) {

	var firstTime = querystring.parse(postData).firstTime;
	if (firstTime !== 'true') {
		console.log('starting search - ' + new Date().toString());
	} else {
		// cleanup the chart so it fits better
		createPages.updateNoLegend();
	}
	var rangeOrSingle = 'single';
	var startLength = 2;
	var endLength = -1;
	var frameThreshold = 0;
	var distanceThreshold = 0.0;
	var savedMatches = [];
	var outputPage;
	var temp = [];
	var lineCount = parseInt(querystring.parse(postData).lineCount);

	var distances = [];
	for( b = 0; b < BONE_COUNT; b++) {
		distances[b] = new Array(lineCount);
		distances[b] = querystring.parse(postData)['bDist' + b].split(',');
		for( l = 0; l < distances[b].length; l++) {
			distances[b][l] = parseFloat(distances[b][l]);
		}
	}
	
	// remove any previous files for this page so we show the clean results
	try {
		fs.unlinkSync('patternFinder.html');
	} catch(e) {
		// do nothing - file doesn't exist
	}
	try {
		fs.unlinkSync('matchresults.html');
	} catch(e) {
		// do nothing - file doesn't exist
	}
	
	var fd = fs.openSync('patternFinder.html', 'a');
	var writePostn = 0;
	var bytesWritten = 0;

	var fd = fs.openSync('matchresults.html', 'w');
	fs.writeSync(fd, '<html><head><meta http-equiv="refresh" ' +
				 'content="10;url=matchresults.html"></head><body ' + 
				 'style="font-family:Arial;font-size:12pt;background-color:' +
				 '#EEEEEE"><div id="done">Please enter criteria above and ' +
				 'click "find" to begin a search.  Searches may take some ' +
				 'time, depending on the size of your files.</div></body>' +
				 '</html>', 0, 'utf8');
	fs.closeSync(fd);
	
	if(firstTime === 'true') {
		// do nothing - all initialized above
	} else {
		// initialize vars to what was passed to this page
		rangeOrSingle = querystring.parse(postData).checkradio;
		startLength = parseInt(querystring.parse(postData).startLength);
		endLength = parseInt(querystring.parse(postData).endLength);
		frameThreshold = parseInt(querystring.parse(postData).frameThreshold);
		distanceThreshold = parseFloat(
							  querystring.parse(postData).distanceThreshold);
		fd = fs.openSync('matchresults.html', 'w');
		fs.writeSync(fd, '<html><head><meta http-equiv="refresh" ' + 
					 'content="10;url=matchresults.html"></head>' +
					 '<body style="font-family:Arial;font-size:12pt;' +
					 'background-color:#EEEEEE"><div id="done">' +
					 'Thinking . . . .</div></body></html>', 0, 'utf8');
		fs.closeSync(fd);
		// start the find for patterns
		savedMatches = utilities.getPatterns(startLength, 
											 endLength, 
											 frameThreshold, 
											 distanceThreshold, 
											 distances, 
											 lineCount);

	}
	// create the updated page for search form & match results
	createPages.createSearchPage (rangeOrSingle, 
								  startLength, 
								  endLength, 
								  frameThreshold, 
								  distanceThreshold, 
								  lineCount);

	var file;
	if(firstTime === 'true') {
		// if first time to this page, need to load the frames
		file = fs.readFileSync('search.html');
	} else {
		// otherwise only need to load the search form
		file = fs.readFileSync('patternFinder.html');
	}

	// post or send the page back to the browser
	response.writeHead(200, {'Content-Type' : 'text/html'});
	response.write(file);
	response.end();

}

exports.start = start;
exports.result = result;
exports.patternFinder = patternFinder;
