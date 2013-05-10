var network = window.localRequire("js/network.js");

exports.fromUrl = function(stringUrl, callback) {
	"use strict";
	network.addToStack(stringUrl, "HEAD", function(stringUrl, resultString) {
		exports.fromDomString(resultString, function(jsonObject) {
			callback(jsonObject, stringUrl);
		});
	});
};

exports.fromLocal = function(path, callback) {
	"use strict";
	var fs = require('fs');
	if (path.length === 0) {
		return false;
	}
	fs.readFile(path, 'utf8', function(err, data) {
		if (err) {
			console.error(err.message, err.stack);
		}
		exports.fromDomString(data, callback);
	});
};

exports.fromString = function(string, callback) {
	"use strict";
	exports.fromDomString(string, callback);
};

// returns an object
exports.fromDomString = function(domString, callback) {
	"use strict";
	callback(window.$.xml2json(domString));
};