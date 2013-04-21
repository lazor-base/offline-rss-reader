var path = require("path");
var root = path.dirname(global.require.main.filename);
var xml2json = window.localRequire("js/xml2json.js").xml2json;
var json2xml = window.localRequire("js/json2xml.js").json2xml;

function parseXml(xml) {
	return (new window.DOMParser()).parseFromString(xml, "text/xml");
}

exports.fromUrl = function(stringUrl, callback) {
	$.get(stringUrl, function(data) {
		exports.fromDom(data, callback);
	});
};

exports.fromLocal = function(path, callback) {
	var fs = require('fs');
	fs.readFile(path, 'ascii', function(err, data) {
		if (err) {
			console.error(err.message, err.stack);
			// process.exit(1);
		}
		exports.fromDom(parseXml(data), callback);
	});
};

exports.fromString = function(string, callback) {
	var dom = parseXml(string);
	exports.fromDom(dom, callback);
};

exports.fromDom = function(dom, callback) {
	callback(xml2json(dom, "\t"));
};

exports.JsonToXml = function(stringJson, callback) {
	var dom = parseXml(stringJson);
	var json = xml2json(dom, "\t");
	var xml2 = json2xml(eval(json), "\t");
};

exports.ObjectToXml = function(object, callback) {
	var stringJson = JSON.stringify(object);
	exports.JsonToXml(stringJson, callback);
};