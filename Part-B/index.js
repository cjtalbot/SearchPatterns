/**
 * @fileoverview Adapted from code at http://www.nodebeginner.org.  This is
 *   the starting point for the application for Homework #3-Part B.
 * @author Manuel Kiessling (http://www.nodebeginner.org/), modified by
 *   Christine Talbot
 */

var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {};
handle['/'] = requestHandlers.start;
handle['/start'] = requestHandlers.start; // start page for application
handle['/result'] = requestHandlers.result; // shows results of reading files
// allows user to search for patterns in the data from the files
handle['/patternFinder'] = requestHandlers.patternFinder;

server.start(router.route, handle); // starts the server for hosting the pages