process.on("uncaughtException", function(err) {
	console.error(err.message, err.stack);
});
var path = require("path");
var root = path.dirname(global.require.main.filename);
window.localRequire = function(file) {
	return require(path.resolve(root, file));
}
var gui = require('nw.gui');
var win = gui.Window.get();
var config = localRequire("js/config.js");
var uiToolKit = localRequire("js/uitoolkit.js");
var network = localRequire("js/network.js");
var feed = localRequire("js/feed.js");
window.getMissingFeeds = feed.getMissingFeeds;
window.getUrlHead = network.getUrlHead;
window.getUrlBody = network.getUrlBody;
network.onComplete(function() {
	console.timeEnd("network");
	$("#reloadWindow").text("Reload").prop("disabled", false);
	console.log("All feeds have reportedly been processed")
});
network.onStart(function() {
	console.time("network");
	$("#reloadWindow").text("Loading").prop("disabled", true);
});
var optionsWindow = null;
var isMaximized = false;
config.loadConfig(function(localConfig) {
	$(function() {
		$("#showDevTools").on("click", function() {
			win.showDevTools();
		});
		$("#closeWindow").on("click", function() {
			win.close();
		});
		$("#hideWindow").on("click", function() {
			win.minimize();
		});
		$("#reloadWindow").on("click", function() {
			if ($(this).prop("disabled")) {
				return false;
			}
			feed.getAllFeeds(function(resultObject) {
				console.log(resultObject);
			});
		});
		$("#fullWindow").on("click", function() {
			win.toggleFullscreen();
			var self = $(this);
			if (self.text() === "Exit fullscreen") {
				$(this).text("Fullscreen");
			} else {
				$(this).text("Exit fullscreen");
			}
		});
		$("#optionsLink").on("click", function() {
			if (optionsWindow) {
				optionsWindow.focus();
				optionsWindow.reloadIgnoringCache();
			} else {
				optionsWindow = gui.Window.get(window.open('options.html'));
				optionsWindow.on('closed', function() {
					optionsWindow = null;
				});
			}
		});

		$("#maxWindow").on("click", function() {
			if (!isMaximized) {
				win.maximize();
				isMaximized = true;
				$(this).text("Unmaximize");
			} else {
				win.unmaximize();
				isMaximized = false;
				$(this).text("Maximize");
			}
		});
	});
});