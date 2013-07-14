var goodStatus = [100, 101, 200, 201, 202, 203, 204, 206, 307, 405, 501, 503]; // fine for either, may be overridden by individual HEAD or GET settings.
var lostStatus = [305, 400, 402, 403, 404, 406, 407, 410]; // bad for GET or HEAD.
var movedStatus = [300, 301, 302, 303, 304]; // needs to be modified based on content received.
 // this will override any otherwise indicated good status.
var methods = {
	GET:[405,501],
	HEAD:[]
};

exports.isGood = function(statusCode, method) {
	if(goodStatus.indexOf(statusCode) > -1 && methods[method].indexOf(statusCode) === -1) {
		return true;
	}
	return false;
};

exports.fixFeed = function(url, statusCode, failure) {
	var feed = localRequire("js/feed.js");
	var network = localRequire("js/network.js");
	if(lostStatus.indexOf(statusCode) > -1) {
		feed.quarantine(url);
	} else if(movedStatus.indexOf(statusCode) > -1) {
		// find out what the url for the new location is and then use feed.change url->newurl
		network.addToStack(url, "GET", function(dataObject) {
			console.warn(dataObject);
		});
	} else {
		failure(feed);
	}
};