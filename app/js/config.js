var fs = require("fs");

var listeners = {};
var localConfig;

exports.loadConfig = function(done) {
	if (localConfig && done) {
		return done(localConfig);
	}
	var fs = require("fs");
	fs.exists("content/config.json", function(exists) {
		if (!exists) {
			fs.readFile("content/config.default.json", 'utf8', function(err, data) {
				if (err) {
					console.error(err.message, err.stack);
				}
				localConfig = JSON.parse(data);
				if (done) {
					return done(localConfig);
				}
			});
		} else {
			fs.readFile("content/config.json", 'utf8', function(err, data) {
				if (err) {
					console.error(err.message, err.stack);
				}
				localConfig = JSON.parse(data);
				if (done) {
					return done(localConfig);
				}
			});
		}
	});
};

exports.getConfig = function() {
	return localConfig;
};

exports.saveConfig = function() {
	var fs = require("fs");
	fs.writeFile("content/config.json", JSON.stringify(localConfig), function(err) {
		if (err) {
			console.error(err.message, err.stack);
		}
	});
};

exports.onChange = function(name, callback) {
	if (!listeners[name]) {
		listeners[name] = [];
	}
	listeners[name].push(callback);
};

//fires after a value change
exports.trigger = function(name, oldValue, newValue) {
	for (var i = 0; i < listeners[name].length; i++) {
		listeners[name][i](oldValue, newValue);
	}
};

exports.getConfigById = function(name) {
	for (var i = 0; i < localConfig.configs.length; i++) {
		var thisConfig = localConfig.configs[i];
		if (thisConfig.id === name) {
			return thisConfig;
		}
	}
};

exports.getCategoryById = function(name) {
	for (var i = 0; i < localConfig.categories.length; i++) {
		var thisConfig = localConfig.categories[i];
		if (thisConfig.id === name) {
			return thisConfig;
		}
	}
};
exports.getConfigValue = function(name) {
	var thisConfig = exports.getConfigById(name);
	return thisConfig.values[thisConfig.value];
};

exports.getValue = function(name) {
	return exports.getConfigValue(name).value;
};

exports.getString = function(name) {
	return exports.getConfigValue(name).string;
};

exports.setValue = function(name, value) {
	var oldValue = exports.getValue(name);
	var thisConfig = exports.getConfigById(name);
	thisConfig.value = value;
	exports.trigger(name, oldValue, value);
};

exports.toggleValue = function(name) {
	var thisConfig = exports.getConfigById(name);
	thisConfig.value++;
	if (thisConfig.value > thisConfig.values.length - 1) {
		thisConfig.value = 0;
	}
};

exports.importGoogleLocal = function(jsonObject) {
	var fs = require('fs');
	fs.writeFile("content/feeds.json", JSON.stringify(jsonObject), function(err) {
		if (err) {
			console.error(err.message, err.stack);
		} else {
			exports.toggleValue("importGoogleFeeds");
			exports.saveConfig();
			console.log("Imported feeds");
		}
	});
};