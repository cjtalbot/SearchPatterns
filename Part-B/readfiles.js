/**
 * @fileoverview This file primarily reads and processes calculations of means
 *   and standard deviations on the files available.
 * @author Christine Talbot
 */

var fs = require('fs');
var utilities = require('./utilities');
var createPages = require('./createPages');
var BONE_COUNT = 31; // constant for the number of bones in the file
var NUM_TO_DISCARD = 6; // constant for the number of floats to discard in file


/**
 * This reads and processes calculations of means and standard deviations on the
 *   files available. Calls function to create an html page with the data.
 * @param {Array} fileList Array of strings which include the filenames to be
 *   processed
 */
function readFiles(fileList) {

	var fileLineCounts = []; //integer for each file - fileLineCounts[file] = count
	var fileLines; // holds all the data from the file split by \n character
	var distances = []; // holds per frame & per bone the euclidean distance from root - distances[frame][bone] = distance
	var allMeans = []; // holds per bone the mean distance from root across all frames/files - allMeans[bone] = mean
	var allStdDev = []; // holds per bone the standard deviation for the distance from root across all frames/files - allStdDev[bone] = stddev
	var maxDist = 0; // holds the maximum euclidean distance for all bones across all frames and all files
	var lineRead; // holds all the floats in string format from one line of the file
	var allSummed = []; // holds a running sum for each bone's distance from root to save re-looping - allSummed[bone] = sumdists
	var currentLineCounter = 0; // keeps track of what line (across all files) we're reading
	var oneLineOfFloats = []; // holds the float version of the floats read from one line

	// initialize bone-based arrays
	for (var i = 0; i < 31; i++) {
		allMeans[i] = 0;
		allStdDev[i] = 0;
		allSummed[i] = 0;
	}

	// for each file in the list
	var numFiles = fileList.length;
	var curLineCount = 0;
	var curLineLength = 0;
	for (var fileNum = 0; fileNum < numFiles; fileNum++) {

		// parse the file into lines
		fileLines = fs.readFileSync(fileList[fileNum]).toString().split('\n');

		// verify the line count by checking the last line for being empty
		if (fileLines[fileLines.length-1].length !== 99) {
			fileLineCounts[fileNum] = fileLines.length - 1;
		} else {
			fileLineCounts[fileNum] = fileLines.length;
		}

		// initialize the distance array which is per frame, then per bone
		for (var i = currentLineCounter;
			 i < currentLineCounter + fileLineCounts[fileNum];
			 i++) {

			distances[i] = new Array(BONE_COUNT);
		}

		// for each line in this file
		curLineCount = fileLineCounts[fileNum];
		for (var lineNum = 0; lineNum < curLineCount; lineNum++) {

			// parse the line into float strings, by using a tab separator
			lineRead = fileLines[lineNum].split('\t');

			// convert each string into a real float
			curLineLength = lineRead.length;
			for (var i = 0; i < curLineLength; i++) {
				oneLineOfFloats[i] = parseFloat(lineRead[i]);
			}

			// for each bone, find the euclidean distance to the root bone
			// first 6 values are to be discarded, then all x's are before all
			// y's, which are before all z's
			for (var bone = 0; bone < BONE_COUNT; bone++) {

				distances[currentLineCounter][bone] =
				  utilities.getEuclidean(oneLineOfFloats[NUM_TO_DISCARD],
				  						 oneLineOfFloats[NUM_TO_DISCARD +
				  						 				 BONE_COUNT],
				  						 oneLineOfFloats[NUM_TO_DISCARD +
				  						   				 (2*BONE_COUNT)],
				  						 oneLineOfFloats[bone + NUM_TO_DISCARD],
				  						 oneLineOfFloats[bone + NUM_TO_DISCARD +
				  						   				 BONE_COUNT],
				  						 oneLineOfFloats[bone + NUM_TO_DISCARD +
				  						   				 (2*BONE_COUNT)]);

				// keep a running sum to avoid re-running through loop again
				allSummed[bone] = allSummed[bone] +
								  distances[currentLineCounter][bone];

				// keep track of the greatest distance from root for charting
				if (maxDist < distances[currentLineCounter][bone]) {
					maxDist = distances[currentLineCounter][bone];
				}
			}
			// keep track of how many lines across all files
			currentLineCounter++;
		}
	}

	// calculate the means for each bone
	for (var bone = 0; bone < BONE_COUNT; bone++) {
		allMeans[bone] = allSummed[bone] / currentLineCounter;
	}

	// calculate the first step of the standard deviation calculation
	for (var line = 0; line < currentLineCounter; line++) {
		for (var bone = 0; bone < BONE_COUNT; bone++) {
			allStdDev[bone] = Math.pow(distances[line][bone] - allMeans[bone],
									   2) + allStdDev[bone];
		}
	}

	// finish the standard deviation calculation
	for (var bone = 0; bone < BONE_COUNT; bone++) {
		allStdDev[bone] = Math.sqrt(allStdDev[bone] / currentLineCounter);
	}

	// create the output page with this information
	createPages.createSummaryPage(distances,
								  allMeans,
								  allStdDev,
								  fileList,
								  fileLineCounts,
								  maxDist);

}

exports.readFiles = readFiles;