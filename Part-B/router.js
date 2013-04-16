/**
 * @fileoverview Adapted from code at http://www.nodebeginner.org.  This forwards
 *   the request for a page to the appropriate function, or displays a page not
 *   found.
 * @author Manuel Kiessling (http://www.nodebeginner.org/), modified by
 *   Christine Talbot
 */

var path = require('path');
var fs = require('fs');

/**
 * This routes the request for a page to the appropriate function, or displays
 *   a page not found.
 * @param {Array} handle ?
 * @param {string} pathname ?
 * @param {document} response Handle to the page/document.
 * @param {string} postData Data sent to the page being requested.
 */
function route(handle, pathname, response, postData) {

	var filename = path.join(process.cwd(), pathname);

	// if the requested page is a function, call it
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, postData);

	// otherwise
	} else {
		path.exists(filename,
					function(exists) {

						// if the page doesn't exist, show Page Not Found
    					if(!exists) {
            				response.writeHead(404,
            								   {'Content-Type': 'text/plain'});
            				response.write('404 Not Found\n');
            				response.end();
            				return;
        				}

        				// otherwise show the page as-is, or an error
  	      				fs.readFile(filename, 'binary',
  	      					function(err, file) {
            					if(err) {
                					response.writeHead(500,
                									   {'Content-Type':
                									   'text/plain'});
                					response.write(err + '\n');
                					response.end();
                					return;
            					}

  								// show the page as-is
            					response.writeHead(200);
            					response.write(file, 'binary');
            					response.end();
        					});
    				});
	}
}

exports.route = route;