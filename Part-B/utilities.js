/**
 * @fileoverview This file provides calculation and lookup functions.
 * @author Christine Talbot
 */

var createPages = require('./createPages');
var BONE_COUNT = 31;

/**
 * This provides a 6 character hexadecimal string for a color to use for the
 *   bone number provided
 * @param {number} b Bone number to be looked up
 * @return {string} Six character hexadecimal color code
 */
function getColor(b) {
// Use the bone # to return a consistent color for that bone
	var color;
	switch (b) {
		case 0:
			color = '000000';
			break;
		case 1:
			color = '3300FF';
			break;
		case 2:
			color = '660033';
			break;
		case 3:
			color = 'FF00FF';
			break;
		case 4:
			color = '006666';
			break;
		case 5:
			color = '6600CC';
			break;
		case 6:
			color = '990000';
			break;
		case 7:
			color = '990066';
			break;
		case 8:
			color = 'CC0000';
			break;
		case 9:
			color = 'FF0000';
			break;
		case 10:
			color = '006600';
			break;
		case 11:
			color = '666600';
			break;
		case 12:
			color = '6600CC';
			break;
		case 13:
			color = '996600';
			break;
		case 14:
			color = '9966FF';
			break;
		case 15:
			color = 'CC6600';
			break;
		case 16:
			color = 'FF6699';
			break;
		case 17:
			color = 'FF6633';
			break;
		case 18:
			color = 'FF9900';
			break;
		case 19:
			color = 'CC9900';
			break;
		case 20:
			color = '999900';
			break;
		case 21:
			color = '009900';
			break;
		case 22:
			color = '3399FF';
			break;
		case 23:
			color = 'CC99FF';
			break;
		case 24:
			color = 'FFCC00';
			break;
		case 25:
			color = 'CCCC00';
			break;
		case 26:
			color = '00CC00';
			break;
		case 27:
			color = '33CCCC';
			break;
		case 28:
			color = 'FFFF00';
			break;
		case 29:
			color = 'CCFF66';
			break;
		case 30:
			color = '00FFFF';
			break;
		default:
			color = 'FFFFFF';
			break;
		}
		return color;

}

/**
 * This provides a string name for the bone number provided
 * @param {number} b Bone number to be looked up
 * @return {string} String name for the bone
 */
function getBoneName(b) {
// Use the bone number to return the name of the bone
	var boneName;
	switch (b) {
		case 0:
			boneName = 'Root';
			break;
		case 1:
			boneName = 'Left Hip Joint';
			break;
		case 2:
			boneName = 'Left Femur';
			break;
		case 3:
			boneName = 'Upper Back';
			break;
		case 4:
			boneName = 'Thorax';
			break;
		case 5:
			boneName = 'Left Hand';
			break;
		case 6:
			boneName = 'Left Fingers';
			break;
		case 7:
			boneName = 'Left Thumb';
			break;
		case 8:
			boneName = 'Left Tibia';
			break;
		case 9:
			boneName = 'Left Foot';
			break;
		case 10:
			boneName = 'Left Toes';
			break;
		case 11:
			boneName = 'Right Hip Joint';
			break;
		case 12:
			boneName = 'Right Femur';
			break;
		case 13:
			boneName = 'Right Tibia';
			break;
		case 14:
			boneName = 'Lower Neck';
			break;
		case 15:
			boneName = 'Upper Neck';
			break;
		case 16:
			boneName = 'Head';
			break;
		case 17:
			boneName = 'Left Clavicle';
			break;
		case 18:
			boneName = 'Left Humerus';
			break;
		case 19:
			boneName = 'Right Foot';
			break;
		case 20:
			boneName = 'Right Toes';
			break;
		case 21:
			boneName = 'Lower Back';
			break;
		case 22:
			boneName = 'Left Radius';
			break;
		case 23:
			boneName = 'Left Wrist';
			break;
		case 24:
			boneName = 'Right Clavicle';
			break;
		case 25:
			boneName = 'Right Humerus';
			break;
		case 26:
			boneName = 'Right Radius';
			break;
		case 27:
			boneName = 'Right Wrist';
			break;
		case 28:
			boneName = 'Right Hand';
			break;
		case 29:
			boneName = 'Right Fingers';
			break;
		case 30:
			boneName = 'Right Thumb';
			break;
		default:
			boneName = 'Not Found';
			break;
		}
		return boneName;
}

/**
 * This finds all the pattern matches for a specified frame and distance
 *   tolerance using a specified window size or range.
 * @param {number} sizeWindow Number of frames to use in the patterns
 * @param {number} endSizeWindow If doing range, the max number of frames
 *   to use in the patterns
 * @param {number} frameTolerance Number of frames that can be incorrect and
 *   still be considered a match
 * @param {number} distanceTolerance Amount that a match can be off by and still
 *   be considered a match
 * @param {object} distances Double array of distances - [bones][frames] =
 *   distance
 * @param {number} numFrames Number of frames in the distances array
 * @return {object} Object with the matches found - format is
 *   {position:<number>, bone:<number>, matchCount:<number>, length:<number>,
 *	 pattern:<array>}
 */
function getPatterns(sizeWindow,
					 endSizeWindow,
					 frameTolerance,
					 distanceTolerance,
					 distances,
					 numFrames) {
// Finds all the pattern matches for a specified frame & distance tolerance
// using a specified window size - across all files, all frames, all bones
	var savedMatches = [];
	var postn = 0;
	var currentSize = 0;
	var tempMatchLength = 0;
	var curWritePostn = 0;
	var res = {};

	// if we're not doing a range of pattern sizes
	if (endSizeWindow === -1) {
		// find the matches for the one size
		res = oneSizePatternFind(sizeWindow,
								 frameTolerance,
								 distanceTolerance,
								 distances,
								 numFrames, 
								 curWritePostn);
		savedMatches = res.savedMatches;
		curWritePostn = res.curWritePostn;
		currentSize = savedMatches.length;
	} else { // doing a range of pattern sizes
		var tempMatches = [];
		// for each window size
		
		for (var i = sizeWindow; i < endSizeWindow+1; i++) {
			
			// find the matches for the one size
			res = oneSizePatternFind(i,
									 frameTolerance,
									 distanceTolerance,
									 distances,
									 numFrames, 
									 curWritePostn);
			tempMatches = res.savedMatches;
			curWritePostn = res.curWritePostn;
			postn = 0;
			tempMatchLength = tempMatches.length;
			// append the matches to our big list of matches
			for (var j = currentSize; j < currentSize + tempMatchLength; j++) {
				savedMatches[j] = tempMatches[postn];
				postn++;
			}
			currentSize = currentSize + tempMatches.length;
		}
	}
	// close out the results page
	createPages.markDone(currentSize, 
						 sizeWindow, 
						 endSizeWindow, 
						 frameTolerance, 
						 distanceTolerance, 
						 curWritePostn);
	
	return savedMatches;
}

/**
 * This finds all the pattern matches for a specified frame and distance
 *   tolerance using a specified window size.
 * @param {number} patternLength Number of frames to use in the pattern
 * @param {number} frameTolerance Number of frames that can be incorrect and
 *   still be considered a match
 * @param {number} distanceTolerance Amount that a match can be off by and still
 *   be considered a match
 * @param {object} distances Double array of distances - [bones][frames] =
 *   distance
 * @param {number} numFrames Number of frames in the distances array
 * @return {object} Object with the matches found & current postn - format is
 *   {savedMatches:{position:<number>, bone:<number>, matchCount:<number>, 
 *   length:<number>, pattern:<array>}, curWritePostn:<number>}
 */
function oneSizePatternFind(patternLength,
							frameTolerance,
							distanceTolerance,
							distances,
							numFrames, curWritePostn) {
// Finds all the pattern matches for a specified frame & distance tolerance
// using a specified window size - across all files, all frames, all bones
	var currentPostn;
	var savedMatches = [];
	var totMatchCount = 0;
	var numMatches;
	var pattern;
	var match;
	var numWrong;
	var checkA;
	var checkB;

	// for each bone
	for (var pb=1; pb < BONE_COUNT; pb++) {
		// for each set of frames of patternLength length
		for (var postn=0; (postn + patternLength) < numFrames ; postn++) {

			// create a pattern to look for
			numMatches = 0;

			// for each bone from where I currently am
			for (var b=pb; b < BONE_COUNT; b++) {
				// for each frame
				for (var checkPostn = 0;
					 (checkPostn + patternLength) < numFrames;
					 checkPostn++) {

					// check if the pattern matches this spot
					if ((checkPostn === postn) && (pb === b)) {
						// skip checking this match
					
					} else {
						match = true;
						numWrong = 0;

						// compare each position of the pattern to the candidate
						for (var i = 0; (i < patternLength) && match; i++) {
							checkA = distances[b][checkPostn + i];
							checkB = distances[pb][postn + i];
							
							if (Math.abs(checkA-checkB) <= distanceTolerance) {
								// do nothing
							} else if (numWrong <= frameTolerance) {
								numWrong++;
							} else {
								match = false;
							}
						}
						// if they match, then increment counter
						if (match === true) {
							numMatches++;
						}
					}
				}
			}
			// if we found more than one match for this pattern, save it
			if (numMatches > 1) {
			
			// let's append it to the file so we can use the file to refresh
				savedMatches[totMatchCount] = {position:postn, bone:pb,
				  matchCount:numMatches, length:patternLength,
				  pattern:distances[pb].slice(postn, postn + patternLength)};
				  
				curWritePostn = createPages.addMatch(
					savedMatches[totMatchCount], 
					curWritePostn);

				totMatchCount++;
			}
		}
	}
	
	return {savedMatches:savedMatches, curWritePostn:curWritePostn};
}

/**
 * This calculates the Euclidean distance from (rx, ry, rz) to (x, y, z).
 * @param {number} rx Root's x position
 * @param {number} ry Root's y position
 * @param {number} rz Root's z position
 * @param {number} x Bone's x position
 * @param {number} y Bone's y position
 * @param {number} z Bone's z position
 * @return {number} Euclidean distance between the two points
 */
function getEuclidean(rx, ry, rz, x, y, z) {
	// sqrt( (rx-x)^2 + (ry-y)^2 + (rz-z)^2 )
	var distance = Math.sqrt(Math.pow(rx - x, 2) +
				   			 Math.pow(ry - y, 2) +
				   			 Math.pow(rz - z, 2));

	return distance;
}


exports.getColor = getColor;
exports.getBoneName = getBoneName;
exports.getPatterns = getPatterns;
exports.getEuclidean = getEuclidean;