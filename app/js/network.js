var networkStatus = localRequire("js/status.js");

var stack = {
	urls: [],
	methods: [],
	callbacks: []
};
var errors = {
	urls: [],
	methods: [],
	messages: [],
	callbacks: []
};
var permanentErrors = {
	urls: [],
	messages: []
};

var maximumConnections = 20;
var maximumRetries = 4;
var coolDownTime = 1000;

var connections = 0;
var totalConnections = [];
var callbacks = [];
var timesProcessed = 0;
var coolDown = false;
var startTime = 0;
var endTime = 0;

exports.addToStack = function(stringUrl, method, callbackFn) {
	"use strict";
	if (typeof onStart === "function") {
		onStart();
		onStart = null;
	}
	if (stack.urls.indexOf(stringUrl) === -1) {
		if (method === "GET") {
			stack.callbacks.unshift(callbackFn);
			stack.urls.unshift(stringUrl);
			stack.methods.unshift(method);
			totalConnections.unshift(stringUrl);
		} else {
			stack.callbacks.push(callbackFn);
			stack.urls.push(stringUrl);
			stack.methods.push(method);
			totalConnections.push(stringUrl);
		}
		exports.processStack();
	}
};

exports.getUrlHead = function(url) {
	exports.addToStack(url, "HEAD", function(requestObject) {
		console.log(requestObject);
	});
};

exports.getUrlBody = function(url) {
	exports.addToStack(url, "GET", function(requestObject) {
		console.log(requestObject);
	});
};

function unique(array) {
	"use strict";
	return array.filter(function(el, index, arr) {
		return index === arr.indexOf(el);
	});
}

function getData() {
	"use strict";
	// console.error("connections (", connections, "/", maximumConnections, ") cool down (", coolDown, ") time (", endTime - startTime, endTime - startTime > coolDownTime, ") endTime (", endTime, ") now (", window.performance.now(), ") remaining (", stack.urls.length, "/", totalConnections.length, ")")
}

window.getData = getData;

exports.processStack = function() {
	"use strict";
	endTime = window.performance.now();
	if (!stack.urls[0]) {
		done();
	} else {
		parseConnections();
		if (coolDown) {
			wait();
		} else {
			fillQue();
		}
	}
};

function fillQue() {
	"use strict";
	while (connections <= maximumConnections && stack.urls[0]) {
		connect();
	}
}

function parseConnections() {
	"use strict";
	if (connections <= 0 || endTime - startTime > coolDownTime) {
		coolDown = false;
	}
	if (connections >= maximumConnections) {
		coolDown = true;
		startTime = window.performance.now();
	}
}

function connect() {
	"use strict";
	exports.request(stack.urls.splice(0, 1)[0], stack.methods.splice(0, 1)[0], stack.callbacks.splice(0, 1)[0]);
	// console.log("connections", connections, "/", maximumConnections, "active with", stack.urls.length, "waiting out of", totalConnections.length, ".");
}

function wait() {
	"use strict";
	// console.warn("Connection que is full with", connections, "/", maximumConnections, ".", stack.urls.length, "remaining.");
}

function done() {
	"use strict";
	coolDown = true;
	if (stack.urls.length === 0) {
		if (connections < 1) {
			// console.log("all connections have completed, and the stack is finished. Processing errors.");
			timesProcessed++;
			handleErrors();
		}
	}
}

function handleErrors() {
	"use strict";
	var thisUrl, thisMessage, thisMethod;
	if (errors.urls.length && timesProcessed <= maximumRetries) {
		console.warn("Error stack has been proccessed ", timesProcessed, " time(s), and the following ", errors.urls.length, "urls are unreachable out of", totalConnections.length, ":", errors.urls, JSON.stringify(errors));
		totalConnections.length = 0;
		for (var i = 0; i < errors.urls.length; i++) {
			thisUrl = errors.urls[i];
			thisMethod = errors.methods[i];
			thisMessage = errors.messages[i];
			if (!thisMessage) {
				console.error(thisMessage, i, errors.messages);
			} else {
				if (typeof thisMessage === "number" || thisMessage.indexOf("ETIMEDOUT") > -1 || thisMessage.indexOf("EAGAIN") > -1) {
					stack.urls.push(thisUrl);
					stack.methods.push(thisMethod);
					totalConnections.push(thisUrl);
				} else {
					networkStatus.fixFeed(stringUrl, status, function(feed) {
						feed.quarantine(thisUrl);
					});
					permanentErrors.urls.push(thisUrl);
					permanentErrors.messages.push(thisMessage);
				}
			}
		}
		errors.messages = unique(errors.messages);
		console.warn("The following", errors.messages.length, "errors occured when trying to process the stack:", errors.messages);
		errors.urls.length = 0;
		errors.methods.length = 0;
		errors.messages.length = 0;
		exports.processStack();
	} else {
		if (errors.urls.length) {
			for (var e = 0; e < errors.urls.length; e++) {
				thisUrl = errors.urls[e];
				thisMessage = errors.messages[e];
				if (!thisMessage) {
					console.error(thisMessage, e, errors.messages);
				} else {
					networkStatus.fixFeed(stringUrl, status, function(feed) {
						feed.quarantine(thisUrl);
					});
					permanentErrors.urls.push(thisUrl);
					permanentErrors.messages.push(thisMessage);
				}
			}
		}
		reinitialize();
	}
}

function reinitialize() {
	"use strict";
	if (permanentErrors.urls.length) {
		console.error("The following", permanentErrors.urls.length, "permanent errors occured when trying to process the stack:", permanentErrors, JSON.stringify(permanentErrors));
	}
	timesProcessed = 0;
	stack.urls.length = 0;
	stack.methods.length = 0;
	totalConnections.length = 0;
	errors.urls.length = 0;
	errors.methods.length = 0;
	errors.urls.length = 0;
	errors.messages.length = 0;
	permanentErrors.urls.length = 0;
	permanentErrors.messages.length = 0;
	connections = 0;
	if (typeof onComplete === "function") {
		onComplete();
	}
}

exports.request = function(stringUrl, method, callback) {
	"use strict";
	connections++;
	var http = require('http');
	var url = require("url");
	var urlData = url.parse(stringUrl);
	urlData.search = urlData.search || "";
	urlData.hash = urlData.hash || "";
	urlData.path = urlData.path || "";
	var options = {
		method: method,
		port: 80,
		host: urlData.host,
		path: urlData.path + urlData.search + urlData.hash
	};

	var httpResponse = function(response) {
		var status = response.statusCode;
		var headers = response.headers;
		response.setEncoding('utf8');
		var str = '';

		response.on('data', function(chunk) {
			str += chunk;
		});

		response.on('end', function() {
			request.setSocketKeepAlive(false);
			connections--;
			if (networkStatus.isGood(status, method)) {
				callback({
					"url": stringUrl,
					"content": str,
					"status": status,
					"headers": headers
				});
			} else {
				console.warn(stringUrl, status, headers, options, str)
				errors.urls.push(stringUrl);
				errors.messages.push(status);
				errors.methods.push(method);
				errors.callbacks.push(callback);
			}
			// if (status !== 200 || headers["content-type"].indexOf("text/html") > -1) {
			// 	console.warn(stringUrl, status, headers, options, str)
			// 	errors.urls.push(stringUrl);
			// 	errors.messages.push(status);
			// 	errors.methods.push(method);
			// 	errors.callbacks.push(callback);
			// } else {
			// 	callback({
			// 		"url": stringUrl,
			// 		"content": str,
			// 		"status": status,
			// 		"headers": headers
			// 	});
			// }
			exports.processStack();
		});
	};

	var request = http.request(options, httpResponse);
	request.on('error', function(e) {
		connections--;
		coolDown = true;
		errors.urls.push(stringUrl);
		errors.messages.push(e.message);
		errors.methods.push(method);
		errors.callbacks.push(callback);
		exports.processStack();
	});
	request.end();
};

var onComplete = null;

exports.onComplete = function(fn) {
	"use strict";
	onComplete = fn;
};

var onStart = null;

exports.onStart = function(fn) {
	"use strict";
	onStart = fn;
};