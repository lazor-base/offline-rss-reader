exports.importGoogleLocal = function(json) {
	var fs = require('fs');
	fs.writeFile("content/feeds.json", json, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
};