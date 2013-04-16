/**
 * @fileoverview Adapted from code at http://www.nodebeginner.org.  This
 *   starts the server listening on port 8888 on the localhost.
 * @author Manuel Kiessling (http://www.nodebeginner.org/), modified by
 *   Christine Talbot
 */

var http = require('http');
var url = require('url');

/**
 * This starts the server listening on port 8888 on the localhost.
 * @param {function} route ?
 * @param {Array} handle ?
 */
function start(route, handle) {
    function onRequest(request, response) {
		var postData = '';
		var pathname = url.parse(request.url).pathname;

        request.setEncoding('utf8');

        request.addListener('data',
        					function(postDataChunk) {
								postData += postDataChunk;
							});

        request.addListener('end',
        					function() {
								route(handle,
									  pathname,
									  response,
									  postData);
							});
	}

    http.createServer(onRequest).listen(8888);
    console.log('\nServer has started.\n\n\n' +
    			'To view the output, please open your browser ' +
				'and point to:\n\n' +
				'http:\\\\localhost:8888\\start\n');
}

exports.start = start;
