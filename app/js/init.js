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
config.loadConfig();
var optionsWindow = null;
var isMaximized = false;
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
		win.reloadIgnoringCache();
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
	$("#importGoogleFeeds").on("change", function() {
		var options = localRequire("js/options.js");
		var config = localRequire("js/config.js");
		conversion.fromLocal($(this).val(), config.importGoogleLocal);
	});
});