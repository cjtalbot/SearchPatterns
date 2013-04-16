/**
 * @fileoverview This file creates all the html & javascript files used by the
 *   application.
 * @author Christine Talbot
 */

var utilities = require("./utilities");
var fs = require('fs');

var BONE_COUNT = 31;

/**
 * This creates the summary page which has the distance per frame per bone
 *   chart and the standard deviations & means for each bone across all files.
 * @param {object} distances Double array of distances - [frame][bone] =
 *   distance
 * @param {array} means Single array of means - [bone] = mean
 * @param {array} stdDevs Single array of standard deviations - [bone] = stdDev
 * @param {array} fileList Single array of filenames
 * @param {array} lineCount Number of lines in each file - [file] = lines
 * @param {number} maxDist Maximum distance any bone is from the root bone in
 *   any frame
 */
function createSummaryPage(distances, 
						   means, 
						   stdDevs, 
						   fileList, 
						   lineCount, 
						   maxDist) {

	var totFrames = 0;
	// sum up the number of lines across all files
	for (var i = 0; i < lineCount.length; i++) {
		totFrames = totFrames + lineCount[i];
	}
	
	// use the info calculated to create a hidden form for passing between
	// pages of application
	createHiddenTablePage(distances, 
						  means, 
						  stdDevs, 
						  maxDist, 
						  lineCount, 
						  fileList, 
						  totFrames);
	
	// create the text for the file
	var fileOutputString = '<html><head><script type="text/javascript" ' +
						   'src="includes/excanvas.js"></script><script ' +
						   'type="text/javascript" src="includes/chart.js">' +
						   '</script><script type="text/javascript" src=' +
						   '"includes/canvaschartpainter.js"></script><link ' +
						   'rel="stylesheet" type="text/css" href="includes/' +
						   'canvaschart.css" /><script type="text/javascript"' +
						   ' src="file1chart.js"></script></head><body ' +
						   'style="font-family:Arial;font-size:12pt;' +
						   'background-color:#EEEEEE" >';

	// include the hidden form into this section of the text
	fileOutputString = fileOutputString + 
					   '<script type="text/javascript">window.onload = ' +
					   'drawall; ' + 
					   ' function changeText() { document.getElementById(' +
					   '"myButton").value="Thinking . . . ."; document.' +
					   'getElementById("myButton").disabled=true; }   ' +
					   'function setTable(){ if(document.getElementById(' +
					   '"displayTable").style.display=="block"){  ' +
					   'document.getElementById("displayText").innerHTML = ' +
					   '"Thinking . . . ."; document.getElementById(' +
					   '"displayTable").style.display="none"; document.' +
					   'getElementById("displayText").innerHTML = "Show ' +
					   'Chart\'s Source Data Table"; } else { document.' +
					   'getElementById("displayText").innerHTML = "Thinking ' +
					   '. . . .";  document.getElementById("displayTable").' +
					   'style.display="block"; document.getElementById(' +
					   '"displayText").innerHTML = "Hide Chart\'s Source ' +
					   'Data Table";  } } </script> <h1>Summarized Results' +
					   '</h1><i><font size="1">As of: ' +  
					   new Date().toString() + 
					   '</font></i><p><form action="/patternFinder" method=' +
					   '"post" onsubmit="return changeText();">' + 
					   fs.readFileSync("hiddenform.html");

	fileOutputString = fileOutputString + 
					   '<input name="firstTime" READONLY VALUE="true" ' +
					   'TYPE=HIDDEN></input><p>Below is a summary of the ' +
					   'data read from the ' + 
					   fileList.length + 
					   ' files (read in order). &nbsp;To perform pattern ' +
					   'analysis on this data: <input id="myButton" type=' +
					   '"submit" value="Click Here"  />' +
					   '</form> </p><font size="2"><ul>';
	
	// add the listing of files for information
	for (var f=0;f < fileList.length;f++) {
		fileOutputString = fileOutputString + '<li>' + fileList[f] + '</li>';
	}
	fileOutputString = fileOutputString + '</ul></font>';
	
	
	fileOutputString = fileOutputString + 
					   '<div style="margin-left:20px;margin-bottom:1em;' + 
					   'font-size:10pt">' +
					   '<p>Total Number of Frames = ' + 
					   totFrames + 
					   '</p>';
	
	// show the dynamically hidden table of distances
	fileOutputString = fileOutputString + 
					   '<center><div style="background-color:blue;color:' +
					   'white;padding:4px"><h3>Euclidean Distances from ' +
					   'Root Bone (Per Frame)</h3></span></div><div id=' +
					   '"file1chart" class="chart" style="width: 900px; ' +
					   'height: 530px;"></div><BR><BR>' +
					   '<a id="displayText" href="javascript:setTable();"> ' +
					   'Show Chart\'s Source Data Table</a><div id=' +
					   '"displayTable"  style="display: none"><br><br><font ' +
					   'size="2">  <table  border="1" cellpadding="3" ' +
					   'cellspacing="0"><tr bgcolor="navy"><span style=' +
					   '"font-weight:bold"><td align="center"><font color=' +
					   '"white" size="2"><b>Frame #</b></font></td>';
	
	// add the data to the distance table
	for (var b=0; b<BONE_COUNT; b++) {
		fileOutputString = fileOutputString + 
						   '<td align="center"><font color="WHITE" size=' +
						   '"2"><b>' + 
						   utilities.getBoneName(b) + 
						   '</b></font></td>';
	}
	
	
	fileOutputString = fileOutputString + '</span></tr>';
	
	// this lists out the distances for each bone in each frame of all the files
	for (var l=0; l <totFrames; l++) {
		fileOutputString = fileOutputString + 
						   '<tr><td align="center"><font size="2">' + 
						   l + 
						   '</font></td>';
		for (var b=0; b<BONE_COUNT; b++) {
			fileOutputString = fileOutputString + 
							   '<td align="right"><font size="2">' + 
							   distances[l][b].toFixed(4) + 
							   '</font></td>';
		}
		fileOutputString = fileOutputString + '</tr>';
	}
	
	// create headers for the mean & standard deviation table
	fileOutputString = fileOutputString + 
					   '</table></font><br><br><a id="displayText2" href=' +
					   '"javascript:setTable();">Hide Chart\'s Source Data ' +
					   'Table</a></div> <br><br><br>' +
					   '<table border="1" cellpadding="10"><tr bgcolor="navy"' +
					   '><span style="font-weight:bold"><td align="center">' +
					   '<font color="WHITE"><b>Bone Name</b></font></td><td ' +
					   'align="center"><font color="WHITE"><b>Mean Euclidean ' +
					   'Distance<p/>from Root Bone</b></font></td><td align=' +
					   '"center"><font color="WHITE"><b>Standard Deviation of' +
					   '<p/>Euclidean Distance<p/>from Root Bone</b></font>' +
					   '</td></span></tr>';
	
	// list out the mean and standard deviation for each bone
	for (var b =0; b < BONE_COUNT; b++) {
		fileOutputString = fileOutputString + 
						   '<tr><td>' + 
						   utilities.getBoneName(b) + 
						   '</td><td align="right">' + 
						   means[b].toFixed(4) + 
						   '</td><td align="right">' + 
						   stdDevs[b].toFixed(4) + 
						   '</td></tr>';
	}
	fileOutputString = fileOutputString + '</table></center></div>';

	
	
	fileOutputString = fileOutputString + '</body></html>';
	
	// create the javascript page for creating the pretty chart of distances
	createGraphJSPage(maxDist, distances);
	
	// save the text to file
	var fd = fs.openSync('results.html', 'w'); 
	fs.writeSync(fd, fileOutputString, 0, encoding='utf8');
	fs.closeSync(fd);

}

/**
 * This creates the javascript file to help generate the pretty chart of
 *   distances of each bone per frame.
 * @param {number} maxDist Maximum distance any bone is from the root bone in
 *   any frame
 * @param {object} distances Double array of distances - [frame][bone] =
 *   distance
 */
function createGraphJSPage(maxDist, distances) {
	// create the beginning of the javascript for generating the chart
	var totFrames = distances.length;
	var fileOutputString = 'function drawall() { var c = new Chart(document' +
						   '.getElementById("file1chart")); c.setDefaultType' +
						   '(CHART_LINE); ' +
						   'c.setGridDensity(7, 20); c.setVerticalRange(0, ' + 
						   (maxDist + 5) + 
						   '); c.setHorizontalLabels(["", "", "", "Frames", ' +
						   '"", "", ""]); '; 
	
	// do loop to get all the euclidean distances per bone for this file
	for (b=0; b < BONE_COUNT; b++) {
		fileOutputString = fileOutputString + 
						   'c.add("' + 
						   utilities.getBoneName(b) + 
						   '", "' + 
						   utilities.getColor(b) + 
						   '", [' + 
						   distances[0][b];
		for (l=1; l < totFrames; l++) {
			fileOutputString = fileOutputString + ', ' + distances[l][b];
		}
		fileOutputString = fileOutputString + ']); ';
	}
	
	// get the javascript to draw the chart defined above
	fileOutputString = fileOutputString + 'c.draw(); } ';
	// make the chart render when the window loads
	fileOutputString = fileOutputString + 'window.onload = drawall; ';
	
	// save the file so can be included elsewhere
	var fd = fs.openSync('file1chart.js', 'w'); 
	fs.writeSync(fd, fileOutputString, 0, encoding='utf8');
	fs.closeSync(fd);
	
}

/**
 * This creates the hidden table of distances for each bone in each frame of
 *   all the files for the hidden form so it can be passed between pages.
 * @param {object} distances Double array of distances - [frame][bone] =
 *   distance
 * @param {array} means Single array of means - [bone] = mean
 * @param {array} stdDevs Single array of standard deviations - [bone] = stdDev
 * @param {number} maxDist Maximum distance any bone is from the root bone in
 *   any frame
 * @param {number} lineCount Number of total lines in all files
 * @param {array} fileList Single array of filenames
 * @param {number} totFrames Number of frames in all files
 */
function createHiddenTablePage(distances, 
							   means, 
							   stdDevs, 
							   maxDist, 
							   lineCount, 
							   fileList, 
							   totFrames) {
	// creates the hidden parameters in the forms to navigate us between pages
	var fileOutputString = '<input name="means" READONLY VALUE=' + 
						   means + 
						   ' TYPE=HIDDEN></input>';
	// need to split up the distance array into an array per bone
	var temp = [];
	for (b=0;b<BONE_COUNT;b++) {
		temp = [];
		for(l=0;l<totFrames;l++) {
			temp[l] = distances[l][b];
		}
		fileOutputString = fileOutputString + 
						   '<input name="bDist' + 
						   b + 
						   '" READONLY VALUE=' + 
						   temp.slice() + 
						   ' TYPE=HIDDEN></input>';
	}
	
	// save other useful variables
	fileOutputString = fileOutputString + 
					   '<input name="stdDevs" READONLY VALUE=' + 
					   stdDevs + 
					   ' TYPE=HIDDEN></input><input name="maxDist" READONLY ' +
					   'VALUE=' + 
					   maxDist + 
					   ' TYPE=HIDDEN></input><input name="lineCount" ' +
					   'READONLY VALUE=' + 
					   totFrames + 
					   ' TYPE=HIDDEN></input><input name="fileList" READONLY' +
					   ' VALUE=' + 
					   fileList + 
					   ' TYPE=HIDDEN></input>';
	// save the file for future import into other htmls
	var fd = fs.openSync('hiddenform.html', 'w'); 
	fs.writeSync(fd, fileOutputString, 0, encoding='utf8');
	fs.closeSync(fd);
}

/**
 * This adds the match to the matchresults.html file's table for display.
 * @param {object} savedMatch Object with the match found - format is
 *   {position:<number>, bone:<number>, matchCount:<number>, length:<number>,
 *	 pattern:<array>}
 * @param {number} curWritePostn Current position in the matchresults.html file
 *   where the end of the results table is
 * @return {object} The new position for the end of the results table in the
 *   matchresults.html file
 */
function addMatch(savedMatch, curWritePostn) {
	var textToWrite = '';
	var numBytesWritten = 0;
	
	// if the file is empty, lets setup the page
	if (curWritePostn === 0) { // haven't written anything yet, so leave a hdr
		textToWrite = '<html><head></head><body style="font-family:Arial;' +
					  'font-size:12pt;background-color:#EEEEEE"><table ' +
					  'cellpadding="5"><tr><td valign="top" width="75%">' +
					  '<center><table border="1" cellpadding="3" ' +
					  'cellspacing="0"><thead><span style="font-weight:bold;' +
					  'color:white"><tr bgcolor="navy"><td rowspan=2 ' +
					  'align=center><font color=white><b>Pattern</b></font>' +
					  '</td><td rowspan=2 align=center><font color=white>' +
					  '<b>Number<br>of<br>Matches</b></font></td><td colspan' +
					  '=2 align=center><font color=white><b>Location of First' +
					  ' Pattern Occurance</b></font></td></tr><tr bgcolor=' +
					  '"navy"><td align=center><font color=white><b>Bone</b>' +
					  '</font></td><td align=center><font color=white><b>' +
					  'Frame</b></font></td></tr></span></thead>';
		//save the file so can append later
 		var fd = fs.openSync('matchresults.html', 'w');
  		numBytesWritten = fs.writeSync(fd, textToWrite, 0, 'utf8');
  		fs.closeSync(fd);
	}
	// Make the pattern look pretty for the table - one value per line
	var pattern = savedMatch.pattern.slice().toString().replace(/,/g, ',<br>');
	
	// add the pattern to the table
	textToWrite = textToWrite + 
				  '<tr><td>[' + 
				  pattern + 
				  ']</td>' + 
				  '<td align=right>' + 
				  savedMatch.matchCount + 
				  '</td><td align=center>' + 
				  utilities.getBoneName(savedMatch.bone) + 
				  '</td><td align=right>' + 
				  savedMatch.position + 
				  '</td></tr>';
	
	textToWrite = textToWrite + 
				  '</table></center></td></tr></table></body></html>';
				  
	// save the updated file
	var fd = fs.openSync('matchresults.html', 'a');
	numBytesWritten = fs.writeSync(fd, textToWrite, curWritePostn, 'utf8');
	fs.closeSync(fd);
	
	// return where the end of the table is now
	return (curWritePostn + numBytesWritten - 49);
}

/**
 * This wraps up the matchresults.html file and adds the query criteria used
 *   for the results found.
 * @param {number} size Number of matches found so can update with no matches
 *   found if 0
 * @param {number} startLength Minimum number of frames to use in the patterns
 * @param {number} endLength If doing range, the max number of frames
 *   to use in the patterns, else -1
 * @param {number} frameThreshold Number of frames that can be incorrect and
 *   still be considered a match
 * @param {number} distanceThreshold Amount that a match can be off by and still
 *   be considered a match
 * @param {number} curPostn Current position in matchresults.html file where 
 *   the end of the table is
 */
function markDone(size, 
				  startLength, 
				  endLength, 
				  frameThreshold, 
				  distanceThreshold, 
				  curPostn) {
	// if there were matches, let's add the criteria used
	if  (size > 0) {
		var fd = fs.openSync('matchresults.html', 'a');
		var textToWrite = '</table></center></td><td valign="top"><h2>Query ' +
						  'Criteria Used:</h2>' + 
						  ((endLength !== -1)?
						  		('Pattern lengths from ' + 
						  	 	 	startLength + 
						  	 	 	' to ' + 
						  	 	 	endLength):
						  		('Pattern length = ' + 
						  	 		startLength)) + 
						  ' with distance threshold = ' +
						  distanceThreshold + 
						  ', and frame threshold = ' + 
						  frameThreshold + 
						  '.</p><br>Found ' + 
						  size + 
						  ' matches across all bone streams.</td></tr>' +
						  '</table></body></html>';
			fs.writeSync(fd, textToWrite, curPostn, 'utf8');
			fs.closeSync(fd);
	} else {
		// otherwise, lets wrap up the document with the criteria we used
		// and tell them to try again
		var fd = fs.openSync('matchresults.html', 'w');
		fs.writeSync(fd, 
					 '<html><head></head><body style="font-family:Arial' +
						';font-size:12pt;background-color:#EEEEEE"><table ' +
						'cellpadding="5"><tr><td valign="top" width="75%">' +
						'Your request did not find any results. Please try ' +
						'again.</td><td valign="top"><h2>Query Criteria Used:' +
						'</h2>' + 
						((endLength !== -1)?
							('Pattern lengths from ' + 
							 	startLength + 
							 	' to ' + 
							 	endLength ):
							('Pattern length = ' + 
								startLength)) + 
						' with distance threshold = ' + 
						distanceThreshold + 
						', and frame threshold = ' + 
						frameThreshold + 
						'.</p><br>Found ' + 
						size + 
						' matches across all bone streams.</td></tr></table>' +
						'</body></html>', 
					  0, 
					  'utf8');
		fs.closeSync(fd);
	}
	console.log('finished search - ' + new Date().toString());
}

/**
 * This creates the initial start page with the list of files to be processed.
 * @param {string} fileListHTML HTML String of form elements for the filelist
 * @return {string} full HTML text for generating the page
 */
function createStartPage(fileListHTML) {
	// simple html text for showing the list of files to be read/processed
	var body = '<html>'+
      		   '<head><link rel="stylesheet" type="text/css" href="includes/' +
      		   'canvaschart.css" />' +
      		   '<meta http-equiv="Content-Type" content="text/html; ' +
      		   'charset=UTF-8" />' +
      		   '<script type="text/javascript">function changeText() { ' +
      		   'document.getElementById("myButton").value="Thinking . . ."; ' +
      		   'document.getElementById("myButton").disabled=true; ' +
      		   'document.getElementById("clearButton").disabled=true; ' +
      		   'document.getElementById("clearButton").value=" . . . "; ' +
      		   'document.getElementById("displayBtn").style.display="none";} ' +
      		   '</script></head>' +
      		   '<body style="font-family:Arial;font-size:12pt;background-' +
      		   'color:#EEEEEE" >'+
      		   '<h1>Looking for Patterns in Mocap Data</h1>' + 
      		   '<p>We will be reading 6 files of data on bone positions ' +
      		   'within each frame of a video. ' +
      		   '&nbsp;From this information we will derive the physical ' +
      		   'distance of each bone to the root ' +
      		   'bone for each frame of each video. &nbsp;We will also derive' +
      		   ' the mean position of each ' +
      		   'bone within each video, as well as its standard deviation of' +
      		   ' its position within the video.</p>' +
      		   '<p>Please review the list of files currently in the ' +
      		   'inputfiles directory and confirm ' +
      		   'these are the files to be used.</p>' +
      		   '<form action="/result" method="post" onsubmit="return ' +
      		   'changeText();" >'+
      		   fileListHTML + 
      		   '<br><br>' +
      		   '<div id="displayBtn"  style="display: block"><input type' +
      		   '="button" id="clearButton" ' +
      		   'value="Incorrect - Refresh File List" onClick="window.' +
      		   'location.reload()"></div>' +
      		   '<input id="myButton" type="submit" value="Confirm File List"' +
      		   ' /></form></body></html>';
    
    return body;
}

/**
 * This creates the search page HTML with a form for searching patterns.
 * @param {string} rangeOrSingle String of 'single' or 'multiple' indicating
 *   whether we are searching for one pattern length or more than one
 * @param {number} startLength Minimum number of frames to use in the patterns
 * @param {number} endLength If doing range, the max number of frames
 *   to use in the patterns, else -1
 * @param {number} frameThreshold Number of frames that can be incorrect and
 *   still be considered a match
 * @param {number} distanceThreshold Amount that a match can be off by and still
 *   be considered a match
 * @param {number} lineCount Number of lines in the files being processed
 */
function createSearchPage (rangeOrSingle, 
						   startLength, 
						   endLength, 
						   frameThreshold, 
						   distanceThreshold, 
						   lineCount ) {
						   	
		var outputPage;
		var savedMatches = {};
		// open the file for writing
		var fd = fs.openSync('patternFinder.html', 'w');
		
		// a lot of javascript for some form validations
		outputPage = '<html><head><script type="text/javascript">';
		outputPage = outputPage + 
					 'function myVal() { ' + '	if (isNaN(' +
					 'document.getElementById("startLength").value)) { ' + 
					 ' alert("Invalid Start Position -- must be an integer!"' +
					 '); return false; ' + 
					 '} else if (document.getElementById("startLength").' +
					 'value.indexOf(".") !== -1) { ' + 
					 ' alert("Invalid Start Position -- must be an integer!' +
					 '"); return false;' + 
					 '	} else if ((parseInt(document.getElementById(' +
					 '"startLength").value) >= ' + 
					 lineCount + 
					 ') ||	(parseInt(document.getElementById("startLength' +
					 '").value) < 2)) { ' + 
					 ' alert("Invalid Start Position -- must be between 2 ' +
					 'and ' + 
					 (lineCount - 1) + 
					 '!"); return false; ' + 
					 '	} if (document.getElementById("multiple").checked' +
					 ' === true) {  if (isNaN(document.getElementById("' +
					 'endLength").value)) { ' + 
					 ' alert("Invalid End Position -- must be an integer!"); ' + 
					 '	return false; } else if (document.getElementById(' +
					 '"endLength").value.indexOf(".") !== -1) { ' + 
					 ' alert("Invalid End Position -- must be an integer!");' + 
					 '	return false; } else if ((parseInt(document.' +
					 'getElementById("endLength").value) >= ' + 
					 lineCount + 
					 ') ||	(parseInt(document.getElementById("endLength")' +
					 '.value) <= parseInt(document.getElementById("' +
					 'startLength").value))) { ' + 
					 '	alert("Invalid End Position -- must be between " ' +
					 '+ document.getElementById("startLength").value + " and ' + 
					 (lineCount - 1) + 
					 '!");  return false;  } 	} ' + 
					 '	if (isNaN(document.getElementById("frameThreshold"' +
					 ').value)) { alert("Invalid Frame Threshold Amount --' +
					 ' must be an integer!"); return false;  ' + 
					 '	} else if (document.getElementById("frameThreshold' +
					 '").value.indexOf(".") !== -1) { ' + 
					 ' alert("Invalid Frame Threshold Amount -- must be an' +
					 ' integer!"); return false;  ' + 
					 '	} else if (document.getElementById("multiple"' +
					 ').checked === true) { ' + 
					 ' if ((parseInt(document.getElementById("frameThreshold"' +
					 ').value) >= (parseInt(document.getElementById("' +
					 'endLength").value) - parseInt(document.getElementById(' +
					 '"startLength").value))) ||	(parseInt(document.' +
					 'getElementById("frameThreshold").value) < 0)) { ' + 
					 '	alert("Invalid Frame Threshold Amount -- must be ' +
					 'between 0 and " + (parseInt(document.getElementById' +
					 '("endLength").value) - parseInt(document.getElementById' +
					 '("startLength").value)) + "!");  ' + 
					 ' return false;  }' + 
					 '	} else if (parseInt(document.getElementById' +
					 '("frameThreshold").value) >= parseInt(document.' +
					 'getElementById("startLength").value)) { ' + 
					 ' alert("Invalid Frame Threshold Amount -- must be ' +
					 'between 0 and " + document.getElementById("startLength' +
					 '").value);  return false; } ' + 
					 '	if (isNaN(document.getElementById("distanceThreshold' +
					 '").value)) { ' + 
					 ' alert("Invalid Distance Threshold Amount -- must be' +
					 ' a float!");  return false;  ' + 
					 '	} else if (parseFloat(document.getElementById' +
					 '("distanceThreshold").value) < 0) { ' + 
					 '	alert("Invalid Distance Threshold Amount -- must be' +
					 ' greater than 0!");  return false;	} ' + 
					 '	document.getElementById("myButton").value="' +
					 'Thinking . . ."; document.getElementById("myButton").' +
					 'disabled=true;  if (document.getElementById("single").' +
					 'checked === true) { document.getElementById("endLength' +
					 '").value = -1; } document.getElementById("startLength' +
					 '").readOnly = true; document.getElementById("endLength' +
					 '").readOnly = true; document.getElementById(' +
					 '"frameThreshold").readOnly = true; document.' +
					 'getElementById("distanceThreshold").readOnly = true; ' +
					 ' document.getElementById("checkradio").value = ' +
					 '(document.getElementById("single").checked === true)?' +
					 '"single":"multiple"; document.mysearchform.' +
					 'rangeOrSingle[0].disabled = true; document.mysearchform' +
					 '.rangeOrSingle[1].disabled = true; ' + 
					 '	setupRefresh(); } function setupRefresh() { ' + 
					 '	setTimeout("refreshPage();", 10000);  }  ' + 
					 'function refreshPage() { ' + 
					 '	parent.results.location.href = parent.results.' +
					 'location.href; } function checkSelector() { refreshPage(); if ' +
					 '(document.getElementById("checkradio").value === ' +
					 '"single") { document.getElementById("single").checked' +
					 ' = true; } else { document.getElementById("multiple").' +
					 'checked = true; } if (document.getElementById("single"' +
					 ').checked === true) { hideEndSelector(); 	} else { ' + 
					 '	showEndSelector(); 	} } ' + 
					 'function hideEndSelector() { ' + 
					 '	document.getElementById("endSelector").style.' +
					 'display="none"; document.getElementById("endLength").' +
					 'value = -1; document.getElementById("checkradio").value' +
					 '="single"; } function showEndSelector() { ' + 
					 '	document.getElementById("endSelector").style.' +
					 'display="block"; document.getElementById("checkradio")' +
					 '.value="multiple"; } window.onload = checkSelector; ' +
					 ' </script>';
		outputPage = outputPage + 
					 '<script type="text/javascript" src="includes/excanvas' +
					 '.js"></script><script type="text/javascript" src="' +
					 'includes/chart.js"></script><script type="text/' +
					 'javascript" src="includes/canvaschartpainter.js">' +
					 '</script><link rel="stylesheet" type="text/css" ' +
					 'href="includes/canvaschart.css" /><script type="text/' +
					 'javascript" src="file1chart.js"></script>';
		// here is where we start the visible form for the GUI
		outputPage = outputPage + 
					 '</head><body style="font-family:Arial;font-size:12pt;' +
					 'background-color:#EEEEEE" ><table><tr><td width="600px"' +
					 ' valign="top"><h2>Enter Search Criteria</h2><form name=' +
					 '"mysearchform" action="/patternFinder" method="post" ' +
					 'onsubmit="return myVal();" target="search">Select ' +
					 'search type:<br><ul style="list-style-type: none"><li>' +
					 '<input id="single" name="rangeOrSingle" value="single"' +
					 ' type=radio ' + 
					 ((rangeOrSingle === 'single') ? ' checked ' : '') + 
					 ' onClick="javascript:hideEndSelector();"><font size=' +
					 '"3">Single Pattern Length Only</font></input></li><li>' +
					 '<input id="multiple" name="rangeOrSingle" value=' +
					 '"multiple" type=radio onClick="javascript:' +
					 'showEndSelector();" ' + 
					 ((rangeOrSingle === 'multiple') ? ' checked ' : '') + 
					 '><font size="3">Range of Pattern Lengths</font></input>' +
					 '</li></ul><p>Length of Pattern to Find:<input name=' +
					 '"startLength" id="startLength" value="' + 
					 startLength + 
					 '" type=text size=10></input><div id="endSelector">' +
					 'Longest Length of Pattern to Find:<input id="endLength"' +
					 ' name="endLength" value="' + 
					 endLength + 
					 '" type=text size=10></input></div><p>Number of Frames' +
					 ' Allowed to be Incorrect for Pattern to be a Match:' +
					 '<input id="frameThreshold" name="frameThreshold" ' +
					 'value="' + 
					 frameThreshold + 
					 '"  type=text size=10></input><p>Distance Threshold ' +
					 'Allowed for Pattern to be a Match<input id="' +
					 'distanceThreshold" name="distanceThreshold" value="' + 
					 distanceThreshold + 
					 '" type=text size=10></input><p><input id="myButton"' +
					 ' type=submit value="Find" />';
		// include our hidden data so we can use it for the next search too
		var include = fs.readFileSync('hiddenform.html');
		outputPage = outputPage + include + 
				     '<input id="firstTime" name="firstTime" READONLY VALUE=' +
				     '"false" TYPE=HIDDEN></input><input id="checkradio" ' +
				     'name="checkradio" READONLY VALUE="' + 
				     rangeOrSingle + 
				     '" TYPE=HIDDEN></input> </form></td><td><h4>Euclidean ' +
				     'Distances from Root Bone</h4><div id="file1chart" ' +
				     'class="chart" style="width: 300px; height: 250px;">' +
				     '</div><BR><BR></td></tr></table></body></html>';
		// save it all to file
		fs.writeSync(fd, outputPage, 0, 'utf8');
		fs.close(fd);
	
}

function updateNoLegend() {
	var fd = fs.openSync('file1chart.js', 'a');
	var fileSize = fs.readFileSync('file1chart.js').length;
	fs.writeSync(fd, 'c.setShowLegend(false); c.draw(); } window.onload = drawall; ', fileSize-37, 'utf8');
	fs.close(fd);
}

exports.createStartPage = createStartPage;
exports.createHiddenTablePage = createHiddenTablePage;
exports.createGraphJSPage = createGraphJSPage;
exports.createSummaryPage = createSummaryPage;
exports.addMatch = addMatch;
exports.markDone = markDone;
exports.createSearchPage = createSearchPage;
exports.updateNoLegend = updateNoLegend;