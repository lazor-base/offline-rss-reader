var fs = require("fs");

var listeners = {};
var localConfig;

exports.loadConfig = function() {

};

exports.onChange = function(name, callback) {
	if(!listeners[name]) {
		listeners[name] = [];
	}
	listeners[name].push(callback);
};

//fires after a value change
exports.trigger = function(name, oldValue, newValue) {
	for(var i=0;i<listeners[name].length;i++) {
		listeners[name][i](oldValue, newValue);
	}
};

exports.getValue = function(name) {

};

exports.setValue = function(name, value) {
	var oldValue = exports.getValue(name);

	exports.trigger(name, oldValue, value);
};